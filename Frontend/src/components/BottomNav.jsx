import { Link } from 'react-router-dom';
import { HiLocationMarker, HiChevronUp } from "react-icons/hi"; // Using HeroIcons to match your TopNav

export default function BottomNav() {
  return (
    // The Footer Container
    <div className="h-24 bg-[#86efac] w-full flex justify-between items-end pb-4 px-12 relative z-20 shadow-inner">
      
      {/* Left component : Map */}
      <Link to="/map" className="flex flex-col items-center text-green-900 hover:text-green-700 transition">
        <HiLocationMarker className="w-8 h-8 mb-1" />
        <span className="text-sm font-bold">Map</span>
      </Link>

      {/* Center componnent : Start and Stop tracking walk */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
        <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-gray-100 active:scale-95 transition">
          <span className="text-gray-800 font-bold text-lg">Start</span>
        </button>
      </div>

      {/* Right component: Routes */}
      <Link to="/routes" className="flex flex-col items-center text-green-900 hover:text-green-700 transition">
        <HiChevronUp className="w-8 h-8 mb-1" />
        <span className="text-sm font-bold">Routes</span>
      </Link>

    </div>
  );
}