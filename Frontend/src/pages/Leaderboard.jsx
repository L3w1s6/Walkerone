import { useState } from "react";

export default function Leaderboard() {
     const [timeFilter, setTimeFilter] = useState("weekly");

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

                <button  onClick={() => setTimeFilter("weekly")} className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${timeFilter === 'weekly'
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
                    <p className="py-2"> 1 </p>
                    <p className="py-2"> 2 </p>
                    <p className="py-2"> 3 </p>
            </div>
        </div>
    )
}