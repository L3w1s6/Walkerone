import { useState } from "react";
import BadgeDetails from "./BadgeDetails";

export default function Badge({ emoji, name, unlocked, description, progress }) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <>
            <button type="button" onClick={() => setShowDetails(true)} aria-label={`View ${name} badge details`} className="w-full rounded-xl border border-gray-200 bg-white p-2 text-center shadow-sm select-none clickHover hover:border-gray-300">
                <span className={`mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl ${!unlocked ? 'grayscale opacity-45' : ''}`}>
                    {emoji}
                </span>
                <p className={`font-semibold ${!unlocked ? 'text-gray-400' : 'text-gray-800'}`}>
                    {name}
                </p>
            </button>

            {showDetails && (
                <BadgeDetails emoji={emoji} name={name} description={description} progress={progress} unlocked={unlocked} onClose={() => setShowDetails(false)}/>
            )}
        </>
    )
}