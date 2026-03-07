import { useState } from 'react';
import Task from "../components/Task";

const userEmail = localStorage.getItem('userEmail');

async function addTask(taskData) {
    try {
        const res = await fetch('/addTask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (!res.ok) {
            alert("couldnt add task")
            return false;
        }
        alert("added task")
        return true;
    } catch (err) {
        alert(err)
        return false;
    }
}

export default function Tasks() {
    const [tasks, setTasks] = useState([ // Contains list of tasks, load from db later
        { id: 1, name: "test", description: "1", completionDate: "2026-03-05T14:30", completed: false },
        { id: 2, name: "test", description: "2", completionDate: "2026-03-04T10:00", completed: true },
        { id: 3, name: "test", description: "3", completionDate: "2026-03-06T16:45", completed: false }
    ]);
    const [showCreate, setShowCreate] = useState(false); // State for showing/hiding the creation menu
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskDate, setTaskDate] = useState('');

    const createTask = () => {
        setShowCreate(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (taskName.trim()) { // If there's a task name
            const newTask = {
                id: tasks.length + 1, name: taskName, description: taskDescription, completionDate: taskDate, completed: false, email: userEmail
            };

            addTask(newTask)
            setTasks([...tasks, newTask]); // Append created task
            setTaskName(''); // Reset task name, description and date and hide the creation menu
            setTaskDescription('');
            setTaskDate('');
            setShowCreate(false);
        }
    };

    const toggleTaskCompletion = (taskId) => {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const ongoingTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);

    return (
        <div className="flex flex-col h-full">

            <div className="text-center mb-6 pt-6">
                <h1 className="text-4xl font-black text-green-700 mb-2">
                    Goals
                </h1>
                <p className="text-gray-600 font-medium">
                    Assign and complete goals!
                </p>
            </div>

            <div className={`flex-1 overflow-y-auto ${showCreate ? 'blur-xs' : ''}`}>
                {ongoingTasks.length > 0 &&
                    <div>
                        <div className="border-l-4 border-green-600 bg-green-50 px-5 py-3 mt-4">
                            <span className='text-2xl font-bold text-green-700'> Ongoing </span>
                        </div>
                        <div className="flex flex-col px-5 divide-y divide-gray-200">
                            {ongoingTasks.map((task) => (
                                <Task key={task.id} name={task.name} description={task.description} completionDate={task.completionDate} taskCompleted={task.completed} onToggle={() => toggleTaskCompletion(task.id)} />
                            ))}
                        </div>
                    </div>}

                {completedTasks.length > 0 &&
                    <div>
                        <div className="border-l-4 border-gray-500 bg-gray-100 px-5 py-3 mt-4">
                            <span className="text-2xl font-bold text-gray-700"> Completed </span>
                        </div>
                        <div className="flex flex-col px-5 divide-y divide-gray-200">
                            {completedTasks.map((task) => (
                                <Task key={task.id} name={task.name} description={task.description} completionDate={task.completionDate} taskCompleted={task.completed} onToggle={() => toggleTaskCompletion(task.id)} />
                            ))}
                        </div>
                    </div>}
            </div>

            {/* Menu for creating tasks */}
            {showCreate && (
                <div className="fixed top-30 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl p-6 w-96">
                    <h2 className="text-2xl font-semibold mb-4"> Create New Task </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Task Name</label>
                            <input type="text" value={taskName} placeholder="Enter task name" onChange={(e) => setTaskName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg required" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea value={taskDescription} placeholder="Enter task description" rows="3" onChange={(e) => setTaskDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Completion Date & Time</label>
                            <input type="datetime-local" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-200 rounded-lg transition hover:bg-gray-300 cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 bg-green-300 text-black rounded-lg transition hover:bg-green-400 cursor-pointer">
                                Create Task
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <div className="flex justify-end mb-4 px-5 text-center">
                <button onClick={createTask} className="bg-green-300 rounded-full px-6 py-4 text-4xl cursor-pointer transition active:scale-95 hover:bg-green-400 m-2">
                    +
                </button>
            </div>
        </div>
    )
}