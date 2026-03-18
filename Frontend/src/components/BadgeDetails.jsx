export default function BadgeDetails({ emoji, name, description, progress, unlocked, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div  className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
 
                <div className="flex justify-center">
                    <span className={`flex h-20 w-20 items-center justify-center select-none rounded-full bg-gray-100 text-5xl ${!unlocked ? 'grayscale opacity-45' : ''}`}>
                        {emoji}
                    </span>
                </div>

                <div className="text-center">
                    <h2 className={`text-2xl font-bold ${!unlocked ? 'text-gray-400' : 'text-gray-800'}`}>
                        {name}
                    </h2>
                    {!unlocked && (
                        <p className="text-sm text-gray-400 mt-1">Locked</p>
                    )}
                </div>

                <div>
                    <p className={`text-center text-sm ${!unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                        {description}
                    </p>
                </div>

                {progress && (
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

                <button onClick={onClose} className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer">
                    Close
                </button>
            </div>
        </div>
    )
}
