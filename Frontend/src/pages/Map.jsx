import {useRef, useEffect, useState} from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map() {
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const [error, errorFun] = useState(null)//error state val, function to update it

  useEffect(() => {
    //check browser support
    if (!mapboxgl.supported()) {
      errorFun("Browser doesn't support Mapbox GL")
      return
    }

    //attempt to load map within try catch instead of breaking entire site
    try {
      //check for API token
      if (!mapboxgl.accessToken) {
        throw new Error("Missing Mapbox API token")
      }

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current
      })

      //async internal Mapbox errors
      mapRef.current.on("error", (e) => {
        console.error("Map internal error: ", e)
        errorFun("Failed to load map, internal error: " + e.message)
      })
    } catch (e) {//initialising errors
      console.error("Map error: ", e)
      errorFun("Failed to load map: " + e.message)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  //display <p> if error exists
  if (error) {
    return (
      <div><p className="text-red-600">{error}</p></div>
    )
  }

  return(
    <div id='map-container' ref={mapContainerRef} style={{height: '100%', width: '100%'}}/>
  )
}