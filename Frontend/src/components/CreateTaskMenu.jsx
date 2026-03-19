export default function CreateTaskMenu({ showCreate, handleSubmit, taskName, setTaskName, taskDescription, setTaskDescription, taskDate, setTaskDate, setShowCreate }) {

    return (
        <>
            {/* Menu for creating tasks */}
            {showCreate && (
                <div className="fixed top-30 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl p-6 w-96">
                    <h2 className="text-2xl font-semibold mb-4"> Create New Task </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Task Name</label>
                            <input type="text" value={taskName} placeholder="Enter task name" aria-label="Task name" onChange={(e) => setTaskName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg required" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea value={taskDescription} placeholder="Enter task description" aria-label="Task description" rows="3" onChange={(e) => setTaskDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Completion Date & Time</label>
                            <input type="datetime-local" value={taskDate} aria-label="Task completion date and time" onChange={(e) => setTaskDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button type="button" aria-label="Cancel task creation" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-200 rounded-lg transition hover:bg-gray-300 cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" aria-label="Create task" className="px-4 py-2 bg-green-300 text-black rounded-lg transition hover:bg-green-400 cursor-pointer">
                                Create Task
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}