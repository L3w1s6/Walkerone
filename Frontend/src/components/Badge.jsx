export default function Badge({ emoji, name, unlocked}) {
    return (
        <div className="w-full rounded-xl border border-gray-200 bg-white p-2 text-center shadow-sm cursor-pointer select-none">
            <span className={`mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl ${!unlocked ? 'grayscale opacity-45' : ''}`}>
                {emoji}
            </span>
            <p className={`font-semibold ${!unlocked ? 'text-gray-400' : 'text-gray-800'}`}>
                {name}
            </p>
        </div>
    )
}