import {Link, useNavigate, useLocation} from 'react-router-dom';
import {HiLocationMarker, HiChevronUp} from "react-icons/hi";// Using HeroIcons to match TopNav

const Item = ({name, icon: Icon, path}) => {
    return (
        <Link to={path}>
            <div className="flex flex-col items-center text-green-600 cursor-pointer">
                <Icon className="w-12 h-12 text-green-600"/>
                <span className="text-xl font-medium mb-1"> {name} </span>
            </div>
        </Link>
    )
};

export default function BottomNav({ isRecording }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleStartStop = () => {
        if (!isRecording) {
            window.dispatchEvent(new CustomEvent("startRecording")); // Send signal to map to start recording a route
        }
        else if (isRecording) {
            window.dispatchEvent(new CustomEvent("stopRecording")); // Send signal to map to stop recording a route
        }
        if (location.pathname !== '/map') {
            navigate('/map'); // Go to map if not already there
        }
    };

  return (
    // The Footer Container
    <div className="flex justify-evenly bg-green-300 pt-2 pb-2">
        {/* Left component : Map */}
        <Item name="Map" icon={HiLocationMarker} path="/map"/>

        {/* Center componnent : Start and Stop tracking walk */}
        <div onClick={handleStartStop} className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 active:scale-95 transition cursor-pointer ${isRecording ? 'bg-red-500 border-red-700' : 'bg-white border-gray-600'}`}>
            <span className="text-xl font-medium mb-1 text-gray-800 select-none"> {isRecording ? 'Stop' : 'Start'} </span>
        </div>

        {/* Right component: Routes */}
        <Item name="Routes" icon={HiChevronUp} path="/routes2"/>
    </div>
  );
}