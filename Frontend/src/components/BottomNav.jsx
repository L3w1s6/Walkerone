import {Link} from 'react-router-dom'
import {HiLocationMarker, HiChevronUp} from "react-icons/hi";

const Item = ({name, icon: Icon, path}) => {
    return (
        <Link to={path}>
            <div className="flex flex-col items-center text-green-800 cursor-pointer">
                <Icon className="w-12 h-12 text-green-800"/>
                <span className="text-xl font-medium mb-1">{name}</span>
            </div>
        </Link>
    )
};

export default function BottomNav() {
    return (
        <div className="bg-green-300 pt-2 pb-2 flex justify-evenly items-center cursor-pointer">
            <Item name="Map" icon={HiLocationMarker} path="/map"/>
            <Link to="/">
                <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] active:scale-95 transition-transform cursor-pointer">
                    <span className="text-xl font-semibold text-gray-800">Start</span>
                </div>
            </Link>
            <Item name="Routes" icon={HiChevronUp} path="/routes2"/>
        </div>
    )
}