export default function MobileBody({children}) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-md min-h-screen bg-white flex flex-col justify-between shadow-2xl relative">
                {children}
            </div>
        </div>
    )
};