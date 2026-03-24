import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { io } from 'socket.io-client';
import { TbMapPinPin } from "react-icons/tb";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; // Get mapbox token from .env file (use public key later)

export default function Map({ isRecording, setIsRecording, coordinates, setCoordinates, watchIdRef }) {
  const location = useLocation();
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const geolocateRef = useRef(null); // Store geolocation control to trigger it again
  const lastAutoRecenterAtRef = useRef(0); // Time for when last recenter was when recording a route
  const [error, setError] = useState(null); // State for storing errors
  const [userLocation, setUserLocation] = useState(null); // State for user location, initially set to null
  const [mapLoaded, setMapLoaded] = useState(false);
  const [socket, setSocket] = useState(null);
  const [liveStats, setLiveStats] = useState({ steps: 0, distance: 0, calories: 0, points: 0 });

  const userEmail = localStorage.getItem('userEmail');
  const username = localStorage.getItem('username');
  const routeOwner = username || userEmail;
  const AUTO_RECENTER_INTERVAL_MS = 5000;

  // Recenter the map on button press
  const handleRecenter = () => {
    if (geolocateRef.current) {
      geolocateRef.current.trigger();
    }
  };

  /*
  * How It Works:
  * 1. Map initializes on mount, centered at user's GPS location 
  * 2. When recording starts, watchPosition continuously gets user GPS coordinates
  * 3. Each coordinate is appended to the array and drawn as a line on the map (live send to backend via socket.io later too)
  * 4. When recording stops, route is saved to localStorage and sent to backend
  * 
  * Note: The map is always active via a hidden MapWrapper component at the root (becomes unhidden on this page), which is needed to allow routes to keep drawing when not on the map page
  */



  useEffect(() => {
    const newSocket = io('/', {
      path: '/socket.io',
      autoConnect: false
    });
    setSocket(newSocket);
    const connectTimer = setTimeout(() => {
      newSocket.connect();
    }, 0);

    // Listen for live stats updates (every 3-5 seconds while walking)
    newSocket.on('liveStats', (data) => {
      setLiveStats(data);
    });

    // Listen for route saved confirmation
    newSocket.on('routeSaved', (data) => {
      if (data.success) {
        alert(`Route saved!\n${data.route.stepCount} steps\n${data.route.distance.toFixed(2)} km\n${data.route.caloriesBurned} calories`);
      } else {
        alert('Error: ' + data.message);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection failed:', err.message);
    });

    return () => {
      clearTimeout(connectTimer);
      newSocket.off('liveStats');
      newSocket.off('routeSaved');
      newSocket.off('connect_error');
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);

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
        zoom: 12,
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
          trackUserLocation: false,
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

  // -------------------- Map resize on load --------------------

  // Resize map when navigating to map page
  useEffect(() => {
    if (location.pathname === '/map' && mapRef.current && mapLoaded) {
      // Small delay to ensure map container is visible before resizing
      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, mapLoaded]);

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
    lastAutoRecenterAtRef.current = 0;
    setCoordinates([]); // Clear previous route data
    setLiveStats({ steps: 0, distance: 0, calories: 0, points: 0 });

    watchIdRef.current = navigator.geolocation.watchPosition( // Every time the user's GPS location updates
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, long: longitude });

        // Used to help calculate steps, cal, and distance
        const newCoordinate = { 
          lat: latitude, 
          long: longitude, 
          timestamp: new Date()
        };

        setCoordinates(prev => [...prev, newCoordinate]);

        // Send to backend every 3-5 seconds
        if (socket && routeOwner) {
          socket.emit('liveCoordinate', {
            username: routeOwner,
            coordinate: newCoordinate
          });
        }

        const now = Date.now();
        if (mapRef.current && now - lastAutoRecenterAtRef.current >= AUTO_RECENTER_INTERVAL_MS) { // Only recenter when the last recenter was 5+ seconds ago
          lastAutoRecenterAtRef.current = now; // Set last recenter time to be now
          mapRef.current.flyTo({ center: [longitude, latitude], zoom: 12 });
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
    lastAutoRecenterAtRef.current = 0;

    // Tell backend to calculate step count and save
    if (socket && routeOwner) {
      socket.emit('saveRoute', { username: routeOwner });
    }

    setCoordinates(currentCoords => {
      if (currentCoords.length > 0) {
        const route = {
          id: Date.now(),
          coordinates: currentCoords,
          startTime: new Date(currentCoords[0].timestamp).toISOString(),
          endTime: new Date(currentCoords[currentCoords.length - 1].timestamp).toISOString(),
          email: userEmail
        };

        const savedRoutes = JSON.parse(localStorage.getItem('routes') || '[]');
        localStorage.setItem('routes', JSON.stringify([...savedRoutes, route])); // Save route to localStorage, backup in case connection drops between frontend and backend

        console.log('Route saved:', route);
        // testing
        alert(JSON.stringify(route, null, 3));

        //

       /* addRoute(route).then((ok) => {
          if (ok) {
            alert("data added");
          } else {
            alert ("data not added");
          }

        }); */ // Can be added back if needed, but was causing duplicate data saves in db

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

    const newCoordinate = { 
      lat: newLat, 
      long: newlong, 
      timestamp: new Date()
    };

    setCoordinates(prev => [...prev, newCoordinate]);

    // Send to backend if recording
    if (isRecording && socket && routeOwner) {
      socket.emit('liveCoordinate', {
        username: routeOwner,
        coordinate: newCoordinate
      });
    }

    if (isRecording) {
      const now = Date.now();
      if (mapRef.current && now - lastAutoRecenterAtRef.current >= AUTO_RECENTER_INTERVAL_MS) {
        lastAutoRecenterAtRef.current = now;
        mapRef.current.flyTo({ center: [newlong, newLat], zoom: 12 });
      }
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
        <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', padding: '15px', borderRadius: '10px'}}>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>Recording...</p>
          <p style={{ margin: '5px 0' }}>Steps: <strong>{liveStats.steps}</strong></p>
          <p style={{ margin: '5px 0' }}>Distance: <strong>{liveStats.distance.toFixed(2)} km</strong></p> 
          <p style={{ margin: '5px 0' }}>Calories: <strong>{liveStats.calories}</strong></p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>Points: {liveStats.points}</p>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>Socket: {socket ? 'on' : 'off'}</p>
        </div>
      )}

      {/* Test Movement Buttons */}
      <div className="absolute bottom-25 left-5 grid grid-cols-3 grid-rows-2 gap-1">
        <button onClick={() => simulateMovement('north')} aria-label="Move north" className="bg-white p-2 font-semibold w-10 h-10 col-start-2 row-start-1 rounded shadow cursor-pointer"> ↑ </button>
        <button onClick={() => simulateMovement('west')} aria-label="Move west" className="bg-white p-2 font-semibold w-10 h-10 col-start-1 row-start-2 rounded shadow cursor-pointer"> ← </button>
        <button onClick={() => simulateMovement('south')} aria-label="Move south" className="bg-white p-2 font-semibold w-10 h-10 col-start-2 row-start-2 rounded shadow cursor-pointer"> ↓ </button>
        <button onClick={() => simulateMovement('east')} aria-label="Move east" className="bg-white p-2 font-semibold w-10 h-10 col-start-3 row-start-2 rounded shadow cursor-pointer"> → </button>
      </div>
      <button onClick={handleRecenter} aria-label="Recenter map" className="absolute bottom-25 right-5 h-12 w-12 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition duration-200 cursor-pointer flex items-center justify-center">
        <TbMapPinPin className="text-slate-800 text-xl" />
      </button>
    </div>
  );
}