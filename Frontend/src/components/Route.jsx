import { Link } from "react-router-dom";

export default function Route({route, showRouteOwner = false, onDelete, currentUsername}) {
    const formatDate = (dateString) => { // Takes in a date and turns it into a readable format
        const date = new Date(dateString);
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return date.toLocaleDateString('en-GB', options);
    }

    const handleDelete = (e) => {
        e.preventDefault(); // When deleting the route, stops it from going to the details of the route page of the deleted route
        onDelete(route._id);
    };

    return (
        <Link to="/route" state={{ route }}>
            <div className="h-auto w-full rounded-lg p-1 bg-white">
                <h2 className="text-3xl font-semibold"> {route.name} </h2>
                {showRouteOwner && route.username && (
                    <p className="text-xs text-neutral-500">By {route.username}</p>
                )}
                <p className="text-sm text-neutral-600"> {formatDate(route.startTime)} | {route.distance}km </p>
                
                {/* Delete button - only show if onDelete exists and it's the user's route */}
                {onDelete && route.username === currentUsername && (
                    <button 
                        onClick={handleDelete}
                        aria-label={`Delete route ${route.name}`}
                        className="p-1 bg-red-500 text-white text-sm rounded cursor-pointer">
                            Delete Route
                    </button>
                )}
            </div>
        </Link>
    )
}