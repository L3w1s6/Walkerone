import { useEffect, useState } from "react";
import PrevRoute from "../components/Route";

export default function Routes() {
    const username = localStorage.getItem('username');
    const [prevRoutes, setPrevRoutes] = useState([]);
    const [routeFilter, setRouteFilter] = useState("friends");

    useEffect(() => {
        const fetchRoutes = async () => {
            if (!username) {
                setPrevRoutes([]);
                return;
            }
            try {
                const response = await fetch(`/showRoutesByUser/${encodeURIComponent(username)}`);
                if (!response.ok) {
                    setPrevRoutes([]);
                    return;
                }
                const data = await response.json();
                setPrevRoutes(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to get routes", error);
                setPrevRoutes([]);
            }
        };
        fetchRoutes();
    }, [username])

    return (
        <div>
            <div className="text-center mb-8 pt-6">
                <h1 className="text-4xl font-black text-green-700 mb-2">
                    Routes
                </h1>
                <p className="text-gray-600 font-medium">
                    View you and your friends' routes!
                </p>
            </div>

            <div className="flex justify-center gap-2 mb-6">

                <button  onClick={() => setRouteFilter("friends")} className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${routeFilter === 'friends'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700'}`}>
                    Friends
                </button>

                <button onClick={() => setRouteFilter("previous")} className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${routeFilter === 'previous'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700'}`}>
                    Previous
                </button>
            </div>

            <div className="flex flex-col px-5 divide-y divide-gray-200">
                {prevRoutes.map((route) => (
                    <PrevRoute key={route._id || route.id} route={route} />
                ))}
            </div>
        </div>
    )
}