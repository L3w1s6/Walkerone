import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; // Get mapbox token from .env file (use public key later)

export default function Map({ isRecording, setIsRecording, coordinates, setCoordinates, watchIdRef }) {
  const location = useLocation();
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const geolocateRef = useRef(null); // Store geolocation control to trigger it again
  const [error, setError] = useState(null); // State for storing errors
  const [userLocation, setUserLocation] = useState(null); // State for user location, initially set to null
  const [mapLoaded, setMapLoaded] = useState(false);

  /*
  * How It Works:
  * 1. Map initializes on mount, centered at user's GPS location 
  * 2. When recording starts, watchPosition continuously gets user GPS coordinates
  * 3. Each coordinate is appended to the array and drawn as a line on the map (live send to backend via socket.io later too)
  * 4. When recording stops, route is saved to localStorage and sent to backend
  * 
  * Note: The map is always active via a hidden MapWrapper component at the root (becomes unhidden on this page), which is needed to allow routes to keep drawing when not on the map page
  */

  // -------------------- Backend Functions --------------------

  // testing backend flow
  async function testFlow() {
    try {
      const res = await fetch('/test');
      const data = await res.json();
      alert(data.msg);
    } catch (err) {
      console.log(err);
      alert("couldnt reach backend");
    }
  }

  async function addRoute(routeData) {
    try {
      const res = await fetch('/addRoute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData)
      });
      if (!res.ok){
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  // -------------------- Map Initialization --------------------

  // Setup the map
  useEffect(() => {
    // Only initialize map once
    if (mapRef.current) {
      return;
    }

    // Check for mapbox browser support
    if (!mapboxgl.supported()) {
      setError("Browser doesn't support Mapbox GL");
      return;
    }

    let geolocationCancelled = false; // Track if geolocation should be ignored

    const initializeMap = (latitude, longitude, heading = 0) => {
      if (geolocationCancelled) { 
        return;
      }

      if (mapRef.current) {
        return; // Don't reinitialize if map already exists
      }

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [longitude, latitude], // Center map on the user's current location
        zoom: 15,
        bearing: heading !== null ? heading : 0
      });

      // Listen for any erros from mapbox
      mapRef.current.on("error", (e) => {
        console.error("Map internal error: ", e);
        setError("Failed to load map, internal error: " + e.message);
      });

      mapRef.current.on('load', () => { // Wait for map to load
        setMapLoaded(true);
        mapRef.current.addSource('route', { // Add route data source to the map
          type: 'geojson',
          data: {
            type: 'Feature', // Geospatial feature
            geometry: {
              type: 'LineString', // Line connecting multiple GPS points
              coordinates: [] // Empty intially, potentially fill in the future if resuming routes etc
            }
          }
        });

        // Add a layer on top of the map that displays the coordinates from the route data source
        mapRef.current.addLayer({
          id: 'route',
          type: 'line', // Draw route as a line
          source: 'route',
          layout: {
            'line-join': 'round', // Join corners smoothly
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#888', // Default colour from docs, change later and maybe add multiple options
            'line-width': 8 // Default line thickness from docs
          }
        });

        // Display blue circle around user location
        const geolocate = new mapboxgl.GeolocateControl({
          trackUserLocation: true,
          showUserLocation: true,
          showAccuracyCircle: true,
          showUserHeading: true,
          showButton: false
        });
        
        // Listen for when tracking becomes inactive and reactivate it
        geolocate.on('trackuserlocationend', () => {
          // Only re-trigger if we're on the map page
          if (location.pathname === '/map') {
            setTimeout(() => {
              if (geolocateRef.current) {
                geolocateRef.current.trigger();
              }
            }, 100);
          }
        });
        
        mapRef.current.addControl(geolocate);
        geolocateRef.current = geolocate; // Store for later triggering
        setTimeout(() => {
          geolocate.trigger(); // Automatically show dot without needing the user to trigger it (wait 500ms for map to load first)
        }, 500);
      });
    };

    // If already recording, use last coordinate or default location
    if (isRecording && coordinates.length > 0) {
      const lastCoord = coordinates[coordinates.length - 1];
      setUserLocation({ lat: lastCoord.lat, long: lastCoord.long });
      initializeMap(lastCoord.lat, lastCoord.long);
      return;
    }

    // Check for geolocation browser support
    if (!navigator.geolocation) {
      setError("Geolocation not supported by browser");
      // Use default location
      initializeMap(51.5074, -0.1278);
      return;
    }

    navigator.geolocation.getCurrentPosition( // Get current GPS position from browser
      (position) => {
        if (geolocationCancelled) return; // Ignore if effect cleanup ran
        
        const { latitude, longitude, heading } = position.coords; // Split GPS position into latitude and longitude (needed for updating location on mapbox)
        setUserLocation({ lat: latitude, long: longitude }); // Save user's current location
        initializeMap(latitude, longitude, heading);
      },

      // If getting GPS location fails, use default location instead
      (error) => {
        if (geolocationCancelled) return; // Ignore if effect cleanup ran
        console.error("Geolocation error:", error.code, error.message);
        console.log("Error codes: PERMISSION_DENIED=1, POSITION_UNAVAILABLE=2, TIMEOUT=3");
        // Initialize map with default location instead of showing error
        initializeMap(51.5074, -0.1278); // Default to London
      },
      {
        enableHighAccuracy: false, // Use GPS locations, instead of cell towers so that routes are more accurate
        timeout: 30000, // Timeout after 30 seconds of trying to get location
        maximumAge: 500 // Only use new coordinates (max 500 ms old)
      }
    );

    // Cleanup function - don't remove map, it stays mounted
    return () => {
      geolocationCancelled = true; // Cancel any pending geolocation callbacks
      // Map persists across page navigation
    };
  }, []);

  // -------------------- Geolocation Management --------------------

  // Trigger geolocation whenever returning to the map page
  useEffect(() => {
    if (location.pathname === '/map' && geolocateRef.current && mapLoaded) {
      // Small delay to ensure map is visible before triggering location
      const timer = setTimeout(() => {
        if (geolocateRef.current) {
          geolocateRef.current.trigger();
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, mapLoaded]);

  // Keep geolocation active when map is visible
  useEffect(() => {
    if (!mapContainerRef.current || !geolocateRef.current || !mapLoaded) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && geolocateRef.current) {
          // Map is visible, trigger geolocation
          setTimeout(() => {
            if (geolocateRef.current) {
              geolocateRef.current.trigger();
            }
          }, 100);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [mapLoaded]);

  // -------------------- Route Visualization --------------------

  // Update coordinates on the map
  useEffect(() => {
    if (mapRef.current && mapLoaded && mapRef.current.getSource('route') && coordinates.length > 0) { // If map exists and a route has been started
      mapRef.current.getSource('route').setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates.map(coord => [coord.long, coord.lat]) // Map each coordinate in the coordinates array into mapbox format
        }
      });
    } else if (mapRef.current && mapRef.current.getSource('route') && !isRecording) {
      // Clear the line when not recording
      mapRef.current.getSource('route').setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      });
    }
  }, [coordinates, isRecording]); // Run whenever coordinates updates

  // -------------------- Listeners For Start/Stop Button Press --------------------

  // Call start recording function when singal recieved from bottom nav
  useEffect(() => {
    const handleStart = () => {
      if (!isRecording) {
        startRecording();

        // testing purposes here!
        alert("now recording");
      }
    };

    const handleStop = () => {
      if (isRecording) {
        stopRecording();
      }
    };

    window.addEventListener('startRecording', handleStart); // Listen for start signal from bottom nav
    window.addEventListener('stopRecording', handleStop); // Listen for stop signal from bottom nav

    return () => {
      window.removeEventListener('startRecording', handleStart);
      window.removeEventListener('stopRecording', handleStop);
    };
  }, [isRecording]);

  // -------------------- Route Recording Functions --------------------

  // Start recording a route
  const startRecording = () => {
    if (!navigator.geolocation) { // Check that geolocation is supported by the briwser
      setError("Geolocation not supported by browser");
      return;
    }

    setIsRecording(true); // Update parent state
    setCoordinates([]); // Clear previous route data

    watchIdRef.current = navigator.geolocation.watchPosition( // Every time the user's GPS location updates
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, long: longitude }); // Update user location

        setCoordinates(prev =>
          [...prev, { lat: latitude, long: longitude, timestamp: Date.now() }] // Append new location coordinates onto the end of the coordinates array
        );

        if (mapRef.current) {
          mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15 }); // Center map on new user location
        }
      },

      // Catch geolocation errors
      (error) => {
        console.error("Geolocation error:", error);
        setError("Failed to get location: " + error.message);
      },
      {
        enableHighAccuracy: true, // Use GPS locations, instead of cell towers so that routes are more accurate
        timeout: 30000, // Timeout after 30 seconds of trying to get location
        maximumAge: 500 // Only use new coordinates (max 500ms old)
      }
    );
  };

  // Stop recording a route
  const stopRecording = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current); // Stop tracking GPS from the browser
      watchIdRef.current = null; // Clear current GPS tracking session ID, now that it's over
    }
    setIsRecording(false); // Update parent state

    // Use functional setState to get current coordinates value
    setCoordinates(currentCoords => {
      if (currentCoords.length > 0) {
        const route = {
          id: Date.now(),
          coordinates: currentCoords,
          startTime: new Date(currentCoords[0].timestamp).toISOString(),
          endTime: new Date(currentCoords[currentCoords.length - 1].timestamp).toISOString()
        };

        const savedRoutes = JSON.parse(localStorage.getItem('routes') || '[]');
        localStorage.setItem('routes', JSON.stringify([...savedRoutes, route])); // Save route to localStorage, backup in case connection drops between frontend and backend

        console.log('Route saved:', route);
        // testing
        alert(JSON.stringify(route, null, 3));

        //

        addRoute(route).then((ok) => {
          if (ok) {
            alert("data added");
          } else {
            alert ("data not added");
          }

        });
      }

      return []; // Clear route data/line on map
    });
  };

  // -------------------- Testing Functions --------------------

  // Simulate movement for testing
  const simulateMovement = (direction) => {
    console.log('isRecording:', isRecording);
    console.log('userLocation:', userLocation);

    if (!userLocation) {
      console.log('No user location, returning');
      return;
    }

    const step = 0.0001; // Step distance (change for bigger/smaller steps)
    let newLat = userLocation.lat;
    let newlong = userLocation.long;

    if (direction === 'north') newLat += step;
    if (direction === 'south') newLat -= step;
    if (direction === 'east') newlong += step;
    if (direction === 'west') newlong -= step;

    setUserLocation({ lat: newLat, long: newlong });

    setCoordinates(prev =>
      [...prev, { lat: newLat, long: newlong, timestamp: Date.now() }] // Append new coordinates onto the end of coordinate array
    );

    if (mapRef.current) {
      mapRef.current.flyTo({ center: [newlong, newLat], zoom: 15 }); // Update map with new coordinates as center
    }
  };

  // -------------------- Display Map --------------------

  // Display <p> if error exists
  if (error) {
    return (
      <div><p className="text-red-600"> {error} </p></div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div id='map-container' ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

      {/* Route Stats */}
      {isRecording && (
        <div style={{ position: 'absolute', top: '20px', right: '20px', }}>
          <p>Recording...</p>
          <p>Points: {coordinates.length}</p>
        </div>
      )}

      {/* Test Movement Buttons */}
      <div className="absolute bottom-25 left-5 grid grid-cols-3 grid-rows-2 gap-1">
        <button onClick={() => simulateMovement('north')} className="bg-white p-2 font-semibold w-10 h-10 col-start-2 row-start-1 rounded shadow cursor-pointer"> ↑ </button>
        <button onClick={() => simulateMovement('west')} className="bg-white p-2 font-semibold w-10 h-10 col-start-1 row-start-2 rounded shadow cursor-pointer"> ← </button>
        <button onClick={() => simulateMovement('south')} className="bg-white p-2 font-semibold w-10 h-10 col-start-2 row-start-2 rounded shadow cursor-pointer"> ↓ </button>
        <button onClick={() => simulateMovement('east')} className="bg-white p-2 font-semibold w-10 h-10 col-start-3 row-start-2 rounded shadow cursor-pointer"> → </button>
      </div>
    </div>
  );
}