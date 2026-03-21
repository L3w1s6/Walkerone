export default function BadgeDetails({ emoji, name, description, progress = 0, tier = 'none', currentValue, nextTier, onClose }) {

    const getTierStyles = (tier) => { // Change styling of badge details based on unlocked tier
        if (tier === 'gold') {
            return {
                label: 'bg-yellow-200 text-yellow-700 border-yellow-400',
                icon: 'bg-yellow-200 border-yellow-400',
            };
        }

        if (tier === 'silver') {
            return {
                label: 'bg-slate-300 text-slate-700 border-slate-500',
                icon: 'bg-slate-300 border-slate-500',
            };
        }

        if (tier === 'bronze') {
            return {
                label: 'bg-amber-100 text-amber-700 border-amber-700',
                icon: 'bg-amber-700/50 border-amber-700',
            };
        }

        return {
            label: 'bg-gray-100 text-gray-600 border-gray-200',
            icon: 'bg-gray-100 border-gray-300',
        };
    };
    const tierLabel = tier === 'none' ? 'Locked' : `${tier.charAt(0).toUpperCase()}${tier.slice(1)}`;
    const tierStyles = getTierStyles(tier);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
 
                <div className="flex justify-center">
                    <span className={`flex h-20 w-20 items-center justify-center select-none rounded-full border-2 text-5xl ${tierStyles.icon}`}>
                        {emoji}
                    </span>
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {name}
                    </h2>
                    <p className={`inline-block mt-2 px-2.5 py-1 text-xs font-bold rounded-full border ${tierStyles.label}`}>
                        {tierLabel} Tier
                    </p>
                </div>

                <div>
                    <p className="text-center text-sm text-gray-600 whitespace-pre-line">
                        {description}
                    </p>
                </div>

                {currentValue && (
                    <p className="text-center text-sm font-semibold text-gray-700">
                        Current: {currentValue}
                    </p>
                )}

                {nextTier && (
                    <p className="text-center text-xs text-gray-500">
                        Next tier unlock at {nextTier}
                    </p>
                )}

                {typeof progress === 'number' && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-gray-700">Progress</p>
                            <p className="text-sm text-gray-600">{progress}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }}/>
                        </div>
                    </div>
                )}

                <button onClick={onClose} aria-label="Close badge details" className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer">
                    Close
                </button>
            </div>
        </div>
    )
}
