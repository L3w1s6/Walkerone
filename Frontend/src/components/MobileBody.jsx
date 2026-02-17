export default function MobileBody({children}) {
    return (
        <div className="flex justify-center bg-gray-100">
            <div className="w-full max-w-md min-h-screen bg-cyan-200 shadow-2xl">
                {children}
            </div>
        </div>
    )
};