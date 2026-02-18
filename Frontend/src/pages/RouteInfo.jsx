import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {Link} from 'react-router-dom';
import {HiChevronLeft} from "react-icons/hi";

export default function RouteInfo() {
    const location = useLocation();
    const route = location.state?.route; // Get the route from the state of this page (set in the routes page)
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (!route || !mapContainer.current || map.current) {
            return;
        }
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

        const totalLat = route.coordinates.reduce((sum, coord) => sum + coord.lat, 0); // Reduce the list of latitude coordinates into a single sum of them all
        const totalLng = route.coordinates.reduce((sum, coord) => sum + coord.long, 0); // Reduce the list of longitude coordinates into a single sum of them all
        const centerLat = totalLat / route.coordinates.length; // Calculate the center of the route in terms of latitude
        const centerLng = totalLng / route.coordinates.length; // Calculate the center of the route in terms of longitude

        map.current = new mapboxgl.Map({ // Setup map, zoomed in on the route's location
            container: mapContainer.current,
            center: [centerLng, centerLat],
            zoom: 16
        })

        map.current.on('load', () => {
            const geojson = { // Convert list of coordinates into a geojson so that mapbox can plot the route
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: route.coordinates.map(coord => [coord.long, coord.lat])
                }
            }

            map.current.addSource('route', { // Get route coordinate data from the geojson
                type: 'geojson',
                data: geojson
            })

            map.current.addLayer({ // Add route on top of the map visually
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#888',
                    'line-width': 8
                }
            })

            // Add markers for route start and end points
            new mapboxgl.Marker({ color: '#22c55e' }) // Green start marker
                .setLngLat([route.coordinates[0].long, route.coordinates[0].lat])
                .addTo(map.current)

            new mapboxgl.Marker({ color: '#ef4444' }) // Red end marker
                .setLngLat([route.coordinates[route.coordinates.length - 1].long, route.coordinates[route.coordinates.length - 1].lat])
                .addTo(map.current)

            setMapLoaded(true)
        })

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [route]);

    if (!route) {
        return <div className="p-4"> No route data available </div>
    }

    return (
        <div className="w-full h-full flex flex-col justify-between z-0">
            <div className="flex flex-row gap-4 items-center bg-white rounded-lg m-4 p-2 z-20">{/*Header containing back button & name*/}
                <Link to="/routes2">
                    <div className="flex items-center rounded-full border-4 cursor-pointer">
                        <HiChevronLeft className="w-12 h-12"/>
                    </div>
                </Link>
                <h1 className="grow text-3xl font-bold">{route.name}</h1>
            </div>

            <div className="routeInfoMap flex-col top-0 z-10">{/*Map loading & actual (positioned behind)*/}
                {!mapLoaded && <div className="routeInfoMap bg-gray-200">Loading map...</div>}
                <div ref={mapContainer} className="routeInfoMap"/>
            </div>
            
            <div className="flex flex-row gap-4 justify-evenly items-center bg-white rounded-lg m-4 p-2 z-20">
                <p className="text-lg">Distance: {route.distance}km</p>
                <p className="text-lg">Calories: 124</p>{/*Example other metric*/}
            </div>
        </div>
    )
}