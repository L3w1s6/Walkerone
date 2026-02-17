import { Link } from "react-router-dom";

export default function Login() {
    return(
        <div>
            <p> page for logging in/registering </p>
            <Link to="/map"> Go to map </Link> {/* Temp link to map for testing */}
        </div>
    )
}