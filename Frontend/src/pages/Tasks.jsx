import { useEffect, useState } from 'react';
import Task from "../components/Task";
import CreateTaskMenu from "../components/CreateTaskMenu";

async function addTask(taskData) {
    try {
        const res = await fetch('/addTask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (!res.ok) {
            alert("couldnt add task")
            return null;
        }
        alert("added task")
        return await res.json();
    } catch (err) {
        alert(err)
        return null;
    }
}

export default function Tasks() {
    const userEmail = localStorage.getItem('userEmail'); // Get logged in user's email
    const [tasks, setTasks] = useState([]); // Contains list of tasks
    const [showCreate, setShowCreate] = useState(false); // State for showing/hiding the creation menu
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskDate, setTaskDate] = useState('');
    const [isEditing, setIsEditing] = useState(false); // State for managing whether or not the user is editing tasks

    // Get all of the user's tasks
    const fetchTasks = async () => {
        if (!userEmail) {
            setTasks([]);
            return;
        }
        try {
            const response = await fetch(`/getTasks?email=${encodeURIComponent(userEmail)}`); // Get tasks by email
            if (!response.ok) {
                return;
            }
            const data = await response.json();
            setTasks(data);
        } catch (err) {
            console.error('Failed to load tasks:', err);
        }
    };
    useEffect(() => {
        fetchTasks();
    }, [userEmail]);

    const createTask = () => {
        setShowCreate(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (taskName.trim()) { // If there's a task name
            const newTask = {
                name: taskName, description: taskDescription, completionDate: taskDate, completed: false, email: userEmail, assignedBy: userEmail
            };

            const createdTask = await addTask(newTask)
            if (!createdTask) {
                return;
            }

            await fetchTasks();
            setTaskName(''); // Reset task name, description and date and hide the creation menu
            setTaskDescription('');
            setTaskDate('');
            setShowCreate(false);
        }
    };

    const updateTask = async (taskId, updates) => {
        try {
            await fetch(`/updateTask/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (err) {
            console.error('Failed to update task:', err);
            return;
        }
        setTasks((currentTasks) =>
            currentTasks.map((t) =>
                (t._id || t.id) === taskId ? { ...t, ...updates } : t
            )
        );
    };

    const toggleTaskCompletion = async (taskId) => {
        const task = tasks.find((t) => (t._id || t.id) === taskId);
        if (!task) return;
        const newCompleted = !task.completed;
        try {
            await fetch(`/updateTask/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: newCompleted })
            });
        } catch (err) {
            console.error('Failed to update task:', err);
            return;
        }
        setTasks((currentTasks) =>
            currentTasks.map((t) =>
                (t._id || t.id) === taskId ? { ...t, completed: newCompleted } : t
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
                {isEditing
                    ? <button onClick={() => setIsEditing(false)}> Done </button>
                    : <button onClick={() => setIsEditing(true)}> Edit </button>
                }
                {ongoingTasks.length > 0 &&
                    <div>
                        <div className="border-l-4 border-green-600 bg-green-50 px-5 py-3 mt-4">
                            <span className='text-2xl font-bold text-green-700'> Ongoing </span>
                        </div>
                        <div className="flex flex-col px-5 divide-y divide-gray-200">
                            {ongoingTasks.map((task) => (
                                <Task key={task._id || task.id} name={task.name} description={task.description} completionDate={task.completionDate} taskCompleted={task.completed} assignedBy={task.assignedBy} isEditing={isEditing} onToggle={() => toggleTaskCompletion(task._id || task.id)} onSave={(updates) => updateTask(task._id || task.id, updates)} />
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
                                <Task key={task._id || task.id} name={task.name} description={task.description} completionDate={task.completionDate} taskCompleted={task.completed} assignedBy={task.assignedBy} isEditing={isEditing} onToggle={() => toggleTaskCompletion(task._id || task.id)} onSave={(updates) => updateTask(task._id || task.id, updates)} />
                            ))}
                        </div>
                    </div>}
            </div>

            <CreateTaskMenu showCreate={showCreate} handleSubmit={handleSubmit} taskName={taskName} setTaskName={setTaskName} taskDescription={taskDescription} setTaskDescription={setTaskDescription} taskDate={taskDate} setTaskDate={setTaskDate} setShowCreate={setShowCreate}/>
            
            <div className="flex justify-end mb-4 px-5 text-center">
                <button onClick={createTask} className="bg-green-300 rounded-full px-6 py-4 text-4xl cursor-pointer transition active:scale-95 hover:bg-green-400 m-2">
                    +
                </button>
            </div>
        </div>
    )
}