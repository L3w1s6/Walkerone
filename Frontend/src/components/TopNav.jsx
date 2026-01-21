import {HiOutlineUserCircle, HiChevronDown} from "react-icons/hi";

const Item = ({name, icon: Icon}) => {
    return (
        <div className="flex flex-col items-center text-gray-600 cursor-pointer">
            <span className="text-xl font-medium mb-1">{name}</span>
            <Icon className="w-12 h-12 text-gray-300"/>
        </div>
    )
};

export default function TopNav() {
    return (
        <div className="bg-cyan-50 pt-4 pb-4 px-4 flex justify-evenly items-center z-10">
            <Item name="Goals" icon={HiChevronDown}/>
            <Item name="Stats" icon={HiChevronDown}/>
            <Item name="Account" icon={HiOutlineUserCircle}/>
        </div>
    )
};