import { useEffect, useState } from "react";

export default function Leaderboard() {
    const [timeFilter, setTimeFilter] = useState("weekly");
    const [entries, setEntries] = useState([]);
    const [error, setError] = useState("");

    const username = localStorage.getItem("username");
    const userEmail = localStorage.getItem("userEmail");

    const getDateRange = (filter) => {
        const start = new Date();
        const end = new Date();
        
        if (filter === "weekly") {
            start.setDate(end.getDate() - 7);
        } else if (filter === "monthly") {
            start.setDate(end.getDate() - 30);
        } else {
            start.setFullYear(2026, 0, 1); // All dates from 1/1/26 onwards
            start.setHours(0, 0, 0, 0);
        }

        return {
            startISO: start.toISOString(), // Convert start and end dates into correct formats for getting data from the db
            endISO: end.toISOString()
        };
    };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { startISO, endISO } = getDateRange(timeFilter);

                const userRes = await fetch(`/getUserData?searchName=${encodeURIComponent(username)}`); // Get data for logged in user
                let friendUsernames = [];

                if (userRes.ok) {
                    const userData = await userRes.json();
                    friendUsernames = Array.isArray(userData?.friends) ? userData.friends : []; // Get list of friends of logged in user
                }

                const selfEntryPromise = fetch(
                    `/getRoutesPeriod?email=${encodeURIComponent(userEmail)}&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}` // Get data from logged in user routes walked within time period
                ).then(async (response) => {
                    if (!response.ok) return null;
                    const data = await response.json();
                    return {
                        username,
                        steps: Array.isArray(data?.steps) ? data.steps[0] || 0 : 0, // Get amount of steps over the time period
                        isSelf: true
                    };
                });

                const friendEntriesPromise = Promise.all(
                    friendUsernames.map(async (friendUsername) => {
                        const friendDataRes = await fetch(
                            `/getUserData?searchName=${encodeURIComponent(friendUsername)}` // Get friends' usernames, for displaying on the leaderboafrd 
                        );
                        if (!friendDataRes.ok) return null;

                        const friendData = await friendDataRes.json();

                        const statsRes = await fetch(
                            `/getRoutesPeriod?email=${encodeURIComponent(friendData.email)}&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}` // Get data from friends' routes walked within time period
                        );
                        if (!statsRes.ok) return null;

                        const statsData = await statsRes.json();
                        return {
                            username: friendUsername,
                            steps: Array.isArray(statsData?.steps) ? statsData.steps[0] || 0 : 0, // Get amount of steps over the time period
                            isSelf: false
                        };
                    })
                );
                const [selfEntry, friendEntries] = await Promise.all([
                    selfEntryPromise,
                    friendEntriesPromise
                ]);

                const ranked = [selfEntry, ...friendEntries]
                    .filter(Boolean) // Removes any weird values from ordering steps (e.g. NaN or null)
                    .sort((a, b) => b.steps - a.steps); // Sort users in order of descending steps

                setEntries(ranked);
            } catch (fetchError) {
                setError("Could not load leaderboard data.");
            }
        };

        fetchLeaderboard();
    }, [timeFilter, username, userEmail]);

    return (
        <div className="p-4 flex flex-col items-center">
            <div className="text-center mb-8 pt-6">
                <h1 className="text-4xl font-black text-green-700 mb-2">
                    Leaderboard
                </h1>
                <p className="text-gray-600 font-medium">
                    See how you rank against your friends
                </p>
            </div>

            <div className="flex justify-center gap-2 mb-6">

                <button onClick={() => setTimeFilter("weekly")} className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${timeFilter === 'weekly'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700'}`}>
                    Weekly
                </button>

                <button onClick={() => setTimeFilter("monthly")} className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${timeFilter === 'monthly'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700'}`}>
                    Monthly
                </button>

                <button onClick={() => setTimeFilter("allTime")} className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${timeFilter === 'allTime'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700'}`}>
                    All time
                </button>
            </div>

            <div className="w-8/10 flex flex-col border border-gray-300 divide-y divide-gray-200 rounded-xl">
                {error && (
                    <p className="py-4 text-center text-red-600">{error}</p>
                )}

                {!error && entries.map((entry, index) => (
                    <div key={`${entry.username}-${index}`} className="py-3 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <p className={`font-bold ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-amber-700" : "text-gray-700"}`}>
                                {index + 1}
                            </p>
                            <p className="font-semibold text-gray-800">
                                {entry.username}
                                {entry.isSelf ? " (You)" : ""}
                            </p>
                        </div>
                        <div className="text-right text-sm text-gray-600">{entry.steps} steps</div>
                    </div>
                ))}

                {!error && entries.length === 0 && (
                    <p className="py-4 text-center text-gray-500">No leaderboard data at this time.</p>
                )}
            </div>
        </div>
    );
}