import {Link} from 'react-router-dom';
import {HiOutlineUserCircle, HiOutlineChartBar, HiClipboardCheck} from "react-icons/hi";

const Item = ({name, icon: Icon, path}) => {
    return (
        <Link to={path} aria-label={`Go to ${name}`}>
            <div className="w-20 rounded-lg flex flex-col items-center text-gray-600 cursor-pointer transition hover:scale-115">
                <span className="text-xl font-medium mb-1"> {name} </span>
                <Icon className="w-12 h-12 text-gray-300"/>
            </div>
        </Link>
    )
};

export default function TopNav() {
    const userType = localStorage.getItem('userType'); // Get type of logged in user (doctor or normal)
    const isDoctor = userType === 'doctor'; // Check if user is doctor
    return (
        <div className="flex justify-evenly pt-2 pb-2 bg-cyan-100">
            {isDoctor ? (
                <>
                    <div className="text-center">
                        <h1 className="text-4xl font-black text-green-700 mb-2">
                            Doctor Dashboard
                        </h1>
                        <p className="text-gray-600 font-medium">
                            Manage your patients
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <Item name="Goals" icon={HiClipboardCheck} path="/tasks"/>
                    <Item name="Stats" icon={HiOutlineChartBar} path="/stats"/>
                    <Item name="Account" icon={HiOutlineUserCircle} path="/account"/>
                </>
            )}
        </div>
    )
};