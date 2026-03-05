export default function Task({name, description, completionDate, taskCompleted, onToggle}) {

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-UK', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="h-auto w-full flex flex-row justify-between rounded-lg p-1 bg-white">
            <div>
                <h2 className={`text-2xl font-semibold ${taskCompleted ? 'line-through' : ''}`}>
                    {name} 
                </h2>
                <div className='flex flex-row gap-2 text-xs text-neutral-500'>
                    <p> {description} </p>
                    <p> | </p>
                    {completionDate && <p className="text-xs text-neutral-500">Due: {formatDate(completionDate)}</p>}
                </div>
            </div>
            <div onClick={onToggle} className={` h-inherit w-16 ${taskCompleted ? "bg-green-300" : "bg-gray-200"} flex justify-center items-center rounded-full cursor-pointer select-none`}>
                <span className="text-4xl"> ✔️ </span>
            </div>
        </div>
    )
}