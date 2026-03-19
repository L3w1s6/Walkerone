import {Link, useNavigate, useLocation} from 'react-router-dom';
import {HiLocationMarker, HiMap, HiUsers, HiOutlineUserCircle} from "react-icons/hi";// Using HeroIcons to match TopNav

const Item = ({name, icon: Icon, path}) => {
    return (
        <Link to={path} aria-label={`Go to ${name}`}>
            <div className="w-20 flex flex-col items-center text-green-600 cursor-pointer transition hover:scale-115">
                <Icon className="w-12 h-12 text-green-600"/>
                <span className="text-xl font-medium mb-1"> {name} </span>
            </div>
        </Link>
    )
};

export default function BottomNav({ isRecording }) {
    const navigate = useNavigate();
    const location = useLocation();
    const userType = localStorage.getItem('userType'); // Get type of logged in user (doctor or normal)
    const isDoctor = userType === 'doctor'; // Check if user is doctor

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
        {isDoctor ? (
            <>
               {/* Left component : Assigned users */}
                <Item name="Users" icon={HiUsers} path="/assignedUsers"/>

                {/* Right component: Account */}
                <Item name="Profile" icon={HiOutlineUserCircle} path="/account"/>
            </>
            ) : (
                <>
                    {/* Left component : Map */}
                    <Item name="Map" icon={HiMap} path="/map"/>

                    {/* Center componnent : Start and Stop tracking walk */}
                    <button type="button" onClick={handleStartStop} aria-label={isRecording ? 'Stop walk recording' : 'Start walk recording'} className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 active:scale-95 transition cursor-pointer hover:scale-115 ${isRecording ? 'bg-red-500 border-red-700' : 'bg-white border-gray-600'}`}>
                        <span className="text-xl font-medium mb-1 text-gray-800 select-none"> {isRecording ? 'Stop' : 'Start'} </span>
                    </button>

                    {/* Right component: Routes */}
                    <Item name="Routes" icon={HiLocationMarker} path="/routes2"/>
                </>
            )
        }
    </div>
  );
}