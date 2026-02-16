import { useLocation } from "react-router-dom"

export default function RouteInfo() {
    const location = useLocation()
    const route = location.state?.route

    return (
        <div>
            <h1> {route.name} </h1>
        </div>
    )
}