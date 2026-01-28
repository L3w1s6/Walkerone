import { useState } from 'react';

export default function Task() {
    const [taskCompleted, setTaskCompleted] = useState(false);

    const handleClick = () => {
        setTaskCompleted(!taskCompleted);
    };

    return (
        <div className="bg-white h-auto w-full flex flex-row justify-between rounded-lg p-1">
            <div>
                <h2 className="text-3xl font-semibold">Name</h2>
                <p className="text-sm text-neutral-600">description</p>
            </div>
            <div onClick={handleClick} className={` h-inherit w-16 ${taskCompleted ? "bg-green-300" : "bg-gray-200"} flex justify-center items-center rounded-full cursor-pointer 
            select-none`}>
                <span className="text-green-400 text-4xl">✔️</span>
            </div>
        </div>
    )
}