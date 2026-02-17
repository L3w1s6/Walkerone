import {Link} from 'react-router-dom';
import {HiOutlineUserCircle, HiChevronDown} from "react-icons/hi";

const Item = ({name, icon: Icon, path}) => {
    return (
        <Link to={path}>
            <div className="flex flex-col items-center text-gray-600 cursor-pointer">
                <span className="text-xl font-medium mb-1"> {name} </span>
                <Icon className="w-12 h-12 text-gray-300"/>
            </div>
        </Link>
    )
};

export default function TopNav() {
    return (
        <div className="flex justify-evenly pt-2 pb-2 bg-cyan-100">
            <Item name="Goals" icon={HiChevronDown} path="/tasks"/>
            <Item name="Stats" icon={HiChevronDown} path="/stats"/>
            <Item name="Account" icon={HiOutlineUserCircle} path="/account"/>
        </div>
    )
};