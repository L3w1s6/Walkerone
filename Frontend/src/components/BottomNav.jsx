import {HiLocationMarker, HiChevronUp} from "react-icons/hi";

const Item = ({name, icon: Icon}) => {
    return (
        <div className="flex flex-col items-center text-green-800 cursor-pointer">
            <Icon className="w-12 h-12 text-green-800"/>
            <span className="text-xl font-medium mb-1">{name}</span>
        </div>
    )
};

export default function BottomNav() {
    return (
        <div className="bg-green-300 pt-4 pb-4 px-4 flex justify-evenly items-center z-10 cursor-pointer">
            <Item name="Map" icon={HiLocationMarker}/>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-[40%] z-20">
                <button className="bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] active:scale-95 transition-transform cursor-pointer">
                    <span className="text-xl font-semibold text-gray-800">Start</span>
                </button>
            </div>
            <Item name="Routes" icon={HiChevronUp}/>
        </div>
    )
}