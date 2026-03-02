import { useState } from 'react';
import Task from "../components/Task";

export default function Tasks() {
    const [tasks, setTasks] = useState([ // Contains list of tasks, load from db later
        { id: 1, name: "test", description: "1" },
        { id: 2, name: "test", description: "2" },
        { id: 3, name: "test", description: "3" }
    ]);
    const [showCreate, setShowCreate] = useState(false); // State for showing/hiding the creation menu
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');

    const createTask = () => {
        setShowCreate(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (taskName.trim()) { // If there's a task name
            const newTask = {
                id: tasks.length + 1, name: taskName, description: taskDescription
            };
            setTasks([...tasks, newTask]); // Append created task
            setTaskName(''); // Reset task name and description, and hide the creation menu
            setTaskDescription('');
            setShowCreate(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`flex-1 overflow-y-auto ${showCreate ? 'blur-xs' : ''}`}>
                <div className="flex flex-col px-5 divide-y divide-gray-200">
                    {tasks.map((task) => (
                        <Task key={task.id} name={task.name} description={task.description}/>
                    ))}
                </div>
            </div>

            {showCreate && (
                <div className="fixed top-30 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl p-6 w-96">
                    <h2 className="text-2xl font-semibold mb-4"> Create New Task </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Task Name</label>
                            <input type="text" value={taskName} placeholder="Enter task name" onChange={(e) => setTaskName(e.target.value)}className="w-full px-3 py-2 border border-gray-300 rounded-lg required"/>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea value={taskDescription} placeholder="Enter task description" rows="3" onChange={(e) => setTaskDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300"/>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-200 rounded-lg transition hover:bg-gray-300 cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg transition hover:bg-green-600 cursor-pointer">
                                Create Task
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <div className="flex justify-end mb-4 px-5">
                <button onClick={createTask} className="bg-green-300 rounded-full px-6 py-4 text-4xl cursor-pointer transition active:scale-95 hover:bg-green-400 m-2">
                    +
                </button>
            </div>
        </div>
    )
}