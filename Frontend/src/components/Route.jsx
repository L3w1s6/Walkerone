import { Link } from "react-router-dom"

export default function Route({route}) {
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const options = { weekday: 'long', day: 'numeric', month: 'long' }
        return date.toLocaleDateString('en-GB', options)
    }

    return (
        <Link to="/route" state={{ route }}>
            <div className="bg-white h-auto w-full rounded-lg p-1">
                <h2 className="text-3xl font-semibold">{route.name}</h2>
                <p className="text-sm text-neutral-600">{formatDate(route.startTime)} | {route.distance}km </p>
            </div>
        </Link>
    )
}