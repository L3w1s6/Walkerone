import { useEffect, useState } from "react";
import PrevRoute from "../components/Route";

export default function Routes() {
    const username = localStorage.getItem('username');
    const [ownPrevRoutes, setOwnPrevRoutes] = useState([]);
    const [friendsPrevRoutes, setFriendsPrevRoutes] = useState([]);
    const [routeFilter, setRouteFilter] = useState("previous");

    useEffect(() => {
        fetchRoutes();
    }, [username])

    const fetchRoutes = async () => {
        if (!username) {
            setOwnPrevRoutes([]);
            setFriendsPrevRoutes([]);
            return;
        }

        try {
                const [ownRoutesResponse, userDataResponse] = await Promise.all([ // Get both own and friends' routes
                fetch(`/showRoutesByUser/${encodeURIComponent(username)}`),
                fetch(`/getUserData?searchName=${encodeURIComponent(username)}`)
            ]);

            let ownRoutes = [];
            if (ownRoutesResponse.ok) {
                const ownData = await ownRoutesResponse.json();
                    ownRoutes = Array.isArray(ownData) ? ownData : []; // Set own routes to the array of routyes
            }

            let friendsRoutes = [];
            if (userDataResponse.ok) {
                const userData = await userDataResponse.json();
                    const friends = Array.isArray(userData?.friends) ? userData.friends : []; // Set friends to array of friends
                if (friends.length > 0) {
                    const friendsRouteResponses = await Promise.all(
                        friends.map((friendUsername) =>
                                fetch(`/showRoutesByUser/${encodeURIComponent(friendUsername)}`) // If the user has friends, get each of their routes
                        )
                    );

                    const friendsRoutesArrays = await Promise.all(
                        friendsRouteResponses.map(async (response) => {
                            if (!response.ok) return [];
                            const data = await response.json();
                            return Array.isArray(data) ? data : [];
                        })
                    );
                        friendsRoutes = friendsRoutesArrays.flat(); // Convert arrays of friend routes into an array containing all of them
                }
            }

            const sortByNewest = (routes) =>
                    [...routes].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)); // Sorts routes from neest -> oldest

            setOwnPrevRoutes(sortByNewest(ownRoutes));
            setFriendsPrevRoutes(sortByNewest(friendsRoutes));
        } catch (error) {
            console.error("Failed to get routes", error);
            setOwnPrevRoutes([]);
            setFriendsPrevRoutes([]);
        }
    };

    // DELETE ROUTE FUNCTION
    const deleteRoute = async (routeId) => {
        if (!confirm('Are you sure you want to delete this route?')) {
            return;
        }

        try {
            const response = await fetch(`/deleteRoute/${routeId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Route deleted successfully!');
                fetchRoutes(); // Refresh the routes list
            } else {
                alert('Failed to delete route');
            }
        } catch (error) {
            console.error('Error deleting route:', error);
            alert('Error deleting route');
        }
    };

    const displayedRoutes = routeFilter === "friends" ? friendsPrevRoutes : ownPrevRoutes;

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
                <button onClick={() => setRouteFilter("friends")} aria-label="Show friends routes" className={`px-4 py-2 rounded-lg font-semibold clickHover ${routeFilter === 'friends'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700'}`}>
                    Friends
                </button>

                <button onClick={() => setRouteFilter("previous")} aria-label="Show your previous routes" className={`px-4 py-2 rounded-lg font-semibold clickHover ${routeFilter === 'previous'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700'}`}>
                    Mine
                </button>
            </div>

            <div className="flex flex-col px-5 divide-y divide-gray-200">
                {displayedRoutes.map((route) => (
                    <PrevRoute 
                        key={route._id || route.id} 
                        route={route} 
                        showRouteOwner={routeFilter === "friends"}
                        onDelete={routeFilter === "previous" ? deleteRoute : null}
                        currentUsername={username}
                    />
                ))}

                {displayedRoutes.length === 0 && (
                    <p className="py-4 text-center text-gray-500">
                        {routeFilter === "friends"
                            ? "No previous routes found from your friends yet."
                            : "No previous routes found yet."}
                    </p>
                )}
            </div>
        </div>
    )
}