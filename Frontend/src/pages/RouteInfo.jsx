import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {Link} from 'react-router-dom';
import {HiReply, HiCog, HiLockClosed, HiCheck} from "react-icons/hi";

// Gold badge thresholds match the badge progression used in profile
const badgeGoldTargets = {
    steps: 100000,
    distance: 100,
    routes: 50
};

//Custom colour gradient cog
const ColourWheelCog = ({click}) => {
    return (
        <div className="flex justify-center items-center">
            {/* Hidden gradient as SVG */}
            <svg className="absolute w-0 h-0">
                <defs>
                    <linearGradient id="colour-wheel" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="16%" stopColor="#f97316" />
                        <stop offset="33%" stopColor="#eab308" />
                        <stop offset="50%" stopColor="#22c55e" />
                        <stop offset="66%" stopColor="#3b82f6" />
                        <stop offset="83%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Apply gradient & animation */}
            <HiCog className="w-12 h-12 fill-[url(#colour-wheel)] transition hover:scale-115 cursor-pointer" onClick={click} />
        </div>
    )
}

export default function RouteInfo() {
    const location = useLocation();
    const route = location.state?.route; // Get the route from the state of this page (set in the routes page)
    const currentUsername = localStorage.getItem("username");
    const isOwnRoute = route?.username === currentUsername;
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [colourOps, setColourOps] = useState([
        {colour: "#f00", locked: false},
        {colour: "#ff0", locked: false},
        {colour: "#0f0", locked: false},
        {colour: "#00f", locked: false},
        {colour: "#f0f", locked: true},
        {colour: "#0af", locked: true},
        {colour: "#f90", locked: true},
        {colour: "#0fa", locked: true}
    ]);//list of colours (some locked behind badges)
    const [selectedColour, setSelectedColour] = useState(-1);//index for colour options

    // Unlock 1 of the 4 locked colours per gold badge, and unlock all 4 when all badges are gold
    useEffect(() => {
        const updateUnlockedColours = async () => {
            // Only calculate unlocks for the logged in user's own routes
            if (!isOwnRoute || !currentUsername) {
                return;
            }

            try {
                // Get all the user's routes to calculate total steps, distance, and route count
                const response = await fetch(`/showRoutesByUser/${encodeURIComponent(currentUsername)}`);
                if (!response.ok) {
                    return;
                }

                const routesData = await response.json();
                const routes = Array.isArray(routesData) ? routesData : [];
                const totals = routes.reduce((total, currentRoute) => {
                    return {
                        steps: total.steps + (Number(currentRoute.stepCount) || 0),
                        distance: total.distance + (Number(currentRoute.distance) || 0),
                        routes: total.routes + 1
                    };
                }, { steps: 0, distance: 0, routes: 0 });

                const goldBadges =
                    (totals.steps >= badgeGoldTargets.steps ? 1 : 0) +
                    (totals.distance >= badgeGoldTargets.distance ? 1 : 0) +
                    (totals.routes >= badgeGoldTargets.routes ? 1 : 0);

                const unlockedLockedColours = goldBadges === 3 ? 4 : goldBadges;  // 3 gold badges should unlock the fourth locked colour as well

                // First 4 colours are always available then unlock the remaining 4 based on earned gold badges
                setColourOps((previousColours) => previousColours.map((colourOption, index) => {
                    if (index < 4) {
                        return { ...colourOption, locked: false };
                    }

                    const lockedColourIndex = index - 4;
                    return { ...colourOption, locked: lockedColourIndex >= unlockedLockedColours };
                }));
            } catch (error) {
                console.error("Failed to update colour unlocks", error);
            }
        };

        updateUnlockedColours();
    }, [isOwnRoute, currentUsername]);

    //set colour field in db for current route
    async function applyColour() {
        if (!isOwnRoute || selectedColour < 0 || selectedColour >= colourOps.length || colourOps[selectedColour].locked) {
            return; // return apply when route is not owned, selection is invalid, or selected colour is still locked
        }

        if (colourOps[selectedColour].colour != route.color) {//check if same colour to save db calls
            try {
                const res = await fetch("/updateRouteColour", {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({id: route._id, colour: colourOps[selectedColour].colour})
                });

                if (res.ok) {//only hide picker if successful
                    setShowPicker(false);
                    console.log(`applied colour ${selectedColour} to route ${route._id}`);
                }
            } catch (e) {
                console.error(e)
            }
        } else {
            console.log("can't apply colour, matches existing colour");
        }
    };

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
                    'line-color': route.color,
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

    useEffect(() => {//change route colour VISUALLY when colour selected
        if (map.current && mapLoaded) {
            map.current.setPaintProperty("route", "line-color", colourOps[selectedColour].colour);
        }
    }, [selectedColour]);

    if (!route) {
        return <div className="p-4"> No route data available </div>
    }

    return (
        <div className="w-full h-full flex flex-col justify-between z-0">
            <div className="flex flex-row gap-4 justify-between items-center bg-white text-grey-600 rounded-lg m-4 p-2 z-20">{/*Header containing back button & name*/}
                <Link to="/routes2" aria-label="Back to routes">
                    <HiReply className="flex items-center w-12 h-12 clickHover"/>
                </Link>

                <h1 className="grow text-3xl font-bold">{route.name}</h1>

                {/* Popup colour picker */}
                {isOwnRoute && showPicker && <div className="absolute top-24 left-4 bg-white w-104 rounded-lg flex flex-row items-center gap-2 p-2">
                    {/* List of colours */}
                    {colourOps.map((item, i) => (
                        <button key={i} style={{backgroundColor: item.colour}} disabled={item.locked} className={`flex justify-center items-center w-12 aspect-square rounded-full border-4 border-grey-600
                        ${item.locked ? "opacity-40 cursor-not-allowed" : "clickHover"}`}
                        onClick={() => {console.log(i + " clicked"); setSelectedColour(i)}}>
                            {item.locked && <HiLockClosed className="w-50% h-50% text-white" />}
                        </button>
                    ))}
                    <HiCheck className="w-12 h-12 clickHover" aria-label="Apply selected colour" onClick={applyColour} />{/* Apply colour btn */}
                </div>}
                
                {isOwnRoute && (
                    <ColourWheelCog aria-label="Show route colour picker" click={() => {setShowPicker(!showPicker)}} />
                )}{/* Experimenting with gradient coloured cog */}
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