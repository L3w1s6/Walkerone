import {Link} from 'react-router-dom';
import {HiLocationMarker, HiChevronUp} from "react-icons/hi";// Using HeroIcons to match TopNav

const Item = ({name, icon: Icon, path}) => {
    return (
        <Link to={path}>
            <div className="flex flex-col items-center text-green-600 cursor-pointer">
                <Icon className="w-12 h-12 text-green-600"/>
                <span className="text-xl font-medium mb-1">{name}</span>
            </div>
        </Link>
    )
};

export default function BottomNav() {
  return (
    // The Footer Container
    <div className="bg-green-300 pt-2 pb-2 flex justify-evenly">
        {/* Left component : Map */}
        <Item name="Map" icon={HiLocationMarker} path="/map"/>

        {/* Center componnent : Start and Stop tracking walk */}
        <Link to="/start">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-gray-600 active:scale-95 transition cursor-pointer">
                <span className="text-xl font-medium mb-1 text-gray-800">Start</span>
            </div>
        </Link>

        {/* Right component: Routes */}
        <Item name="Routes" icon={HiChevronUp} path="/routes2"/>
    </div>
  );
}