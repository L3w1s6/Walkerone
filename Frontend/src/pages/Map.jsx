import {useRef, useEffect, useState} from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; // Get mapbox token from .env file (use public key later)

export default function Map({ setIsRecording }) {
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const [error, setError] = useState(null) // State for storing errors
  const [coordinates, setCoordinates] = useState([])
  const [isRecording, setIsRecordingLocal] = useState(false)
  const [userLocation, setUserLocation] = useState(null) // State for user location, initially set to null
  const watchIdRef = useRef(null) // Reference for GPS tracking session ID

  // Setup the map
  useEffect(() => {
    // Check for mapbox browser support
    if (!mapboxgl.supported()) {
      setError("Browser doesn't support Mapbox GL")
      return
    }

    // Check for geolocation browser support
    if (!navigator.geolocation) {
      setError("Geolocation not supported by browser")
      return
    }

    navigator.geolocation.getCurrentPosition( // Get current GPS position from browser
      (position) => {
        const { latitude, longitude } = position.coords // Split GPS position into latitude and longitude (needed for updating location on mapbox)
        setUserLocation({ lat: latitude, lng: longitude }) // Save user's current location

        if (!mapRef.current) { // Create a map if one doesn't already exist
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current, 
            center: [longitude, latitude], // Center map on the user's current location
            zoom: 15
          })

          // Listen for any erros from mapbox
          mapRef.current.on("error", (e) => {
            console.error("Map internal error: ", e)
            setError("Failed to load map, internal error: " + e.message)
          })

          mapRef.current.on('load', () => { // Wait for map to load
            mapRef.current.addSource('route', { // Add route data source to the map
              type: 'geojson',
              data: {
                type: 'Feature', // Geospatial feature
                geometry: {
                  type: 'LineString', // Line connecting multiple GPS points
                  coordinates: [] // Empty intially, potentially fill in the future if resuming routes etc
                }
              }
            })

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
            })
          })
        }
      },

      // If getting GPS location fails
      (error) => {
        console.error("Geolocation error:", error)
        setError("Failed to get location: " + error.message)
      },
      {
        enableHighAccuracy: true, // Use GPS locations, instead of cell towers so that routes are more accurate
        timeout: 5000, // Timeout after 5 seconds of trying to get location
        maximumAge: 0 // Only use new coordinates
      }
    )

    return () => {
      if (mapRef.current) {
        mapRef.current.remove() // Prevent map duplication
      }
    }
  }, [])

  // Update coordinates on the map
  useEffect(() => {
    if (mapRef.current && mapRef.current.getSource('route') && coordinates.length > 0) { // If map exists and a route has been started
      mapRef.current.getSource('route').setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates.map(coord => [coord.lng, coord.lat]) // Map each coordinate in the coordinates array into mapbox format
        }
      })
    }
  }, [coordinates]) // Run whenever coordinates updates

  // Call start recording function when singal recieved from bottom nav
  useEffect(() => {
      const handleStart = () => {
        if (!isRecording) {
          startRecording();
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

  // Start recording a route
  const startRecording = () => {
    if (!navigator.geolocation) { // Check that geolocation is supported by the briwser
      setError("Geolocation not supported by browser");
      return;
    }

    setIsRecordingLocal(true); // Update route recording state
    setIsRecording(true); // Update parent state
    setCoordinates([]) // Clear previous route data

    watchIdRef.current = navigator.geolocation.watchPosition( // Every time the user's GPS location updates
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude }) // Update user location
        
        setCoordinates(prev => 
          [...prev, { lat: latitude, lng: longitude, timestamp: Date.now() }] // Append new location coordinates onto the end of the coordinates array
        )

        if (mapRef.current) {
          mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15 }) // Center map on new user location
        }
      },

      // Catch geolocation errors
      (error) => {
        console.error("Geolocation error:", error)
                setError("Failed to get location: " + error.message)
      },
      {
        enableHighAccuracy: true, // Use GPS locations, instead of cell towers so that routes are more accurate
        timeout: 5000, // Timeout after 5 seconds of trying to get location
        maximumAge: 0 // Only use new coordinates
      }
    )
  }

  // Stop recording a route
  const stopRecording = () => {
    if (watchIdRef.current) { 
      navigator.geolocation.clearWatch(watchIdRef.current) // Stop tracking GPS from the browser
      watchIdRef.current = null // Clear current GPS tracking session ID, now that it's over
    }
    setIsRecordingLocal(false); // Update local state
    setIsRecording(false); // Update parent state
    
    if (coordinates.length > 0) {
      const route = {
        id: Date.now(),
        coordinates,
        startTime: new Date(coordinates[0].timestamp).toISOString(),
        endTime: new Date(coordinates[coordinates.length - 1].timestamp).toISOString()
      }
      
      const savedRoutes = JSON.parse(localStorage.getItem('routes') || '[]')
      localStorage.setItem('routes', JSON.stringify([...savedRoutes, route])) // Save route to localStorage, backup in case connection drops between frontend and backend
      
      console.log('Route saved:', route)
    }
  }


  // Display <p> if error exists
  if (error) {
    return (
      <div><p className="text-red-600">{error}</p></div>
    )
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div id='map-container' ref={mapContainerRef} style={{height: '100%', width: '100%'}}/>

      {/* Route Stats */}
      {isRecording && (
        <div style={{ position: 'absolute', top: '20px', right: '20px',}}>
          <p>Recording...</p>
          <p>Points: {coordinates.length}</p>
        </div>
      )}
    </div>
  )
}