import { useState } from "react";
import BadgeDetails from "./BadgeDetails";

const getTierStyles = (tier) => { // Change styling of badge based on unlocked tier
    if (tier === 'gold') {
        return {
            card: 'border-yellow-500 ring-2 ring-yellow-400',
            icon: 'bg-yellow-200',
            label: 'text-yellow-700',
        };
    }
    else if (tier === 'silver') {
        return {
            card: 'border-slate-400 ring-2 ring-slate-500',
            icon: 'bg-slate-300',
            label: 'text-slate-700',
        };
    }
    else if (tier === 'bronze') {
        return {
            card: 'border-amber-500 ring-2 ring-amber-700',
            icon: 'bg-amber-700/50',
            label: 'text-amber-700',
        };
    }
    else {
        return {
            card: 'border-gray-200',
            icon: 'bg-gray-100',
            label: 'text-gray-500',
        };
    }
};

export default function Badge({ emoji, name, description, progress, tier = 'none', currentValue, nextTier }) {
    const [showDetails, setShowDetails] = useState(false);
    const tierStyles = getTierStyles(tier);
    const tierLabel = tier === 'none' ? 'Locked' : `${tier.charAt(0).toUpperCase()}${tier.slice(1)}`; // SHow tier, if none unlocked then show locked

    return (
        <div>
            <button onClick={() => setShowDetails(true)} aria-label={`View ${name} badge details`} className={`w-full rounded-xl border bg-white p-2 text-center shadow-sm select-none clickHover hover:border-gray-300 ${tierStyles.card}`}>
                <span className={`mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full text-2xl ${tierStyles.icon}`}>
                    {emoji}
                </span>
                <p className="font-semibold text-gray-800">
                    {name}
                </p>
                <p className={`text-xs font-bold mt-0.5 ${tierStyles.label}`}>
                    {tierLabel}
                </p>
            </button>

            {showDetails && (
                <BadgeDetails emoji={emoji} name={name} description={description} progress={progress} tier={tier} currentValue={currentValue} nextTier={nextTier} onClose={() => setShowDetails(false)}/>
            )}
        </div>
    )
}