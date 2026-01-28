export default function MobileBody({children}) {
    return (
        <div className="bg-gray-100 flex justify-center">
            <div className="w-full max-w-md min-h-screen bg-cyan-200 shadow-2xl">
                {children}
            </div>
        </div>
    )
};