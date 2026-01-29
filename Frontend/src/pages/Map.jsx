import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map() {
    const mapRef = useRef()
    const mapContainerRef = useRef()

    useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
    });

    return () => {
      mapRef.current.remove()
    }
  }, [])

    return(
      <div id='map-container' ref={mapContainerRef} style={{height: '100%', width: '100%'}}/>
    )
}