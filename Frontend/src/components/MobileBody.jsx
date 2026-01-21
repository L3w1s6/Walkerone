export default function MobileBody({children}) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-md min-h-screen bg-white shadow-2xl flex flex-col relative">
                {children}
            </div>
        </div>
    )
};