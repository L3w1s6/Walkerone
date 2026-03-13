import { useState, useEffect } from 'react';
import { GiHealthNormal } from "react-icons/gi";

export default function Task({name, description, completionDate, taskCompleted, assignedBy, isEditing, onToggle, onSave}) {
    const userEmail = localStorage.getItem('userEmail');
    const [editName, setEditName] = useState(name);
    const [editDescription, setEditDescription] = useState(description);
    const [editDate, setEditDate] = useState(completionDate || '');

    useEffect(() => { setEditName(name); }, [name]);
    useEffect(() => { setEditDescription(description); }, [description]);
    useEffect(() => { setEditDate(completionDate || ''); }, [completionDate]);

    // When editing ends, persist changes
    useEffect(() => {
        if (!isEditing) {
            onSave({ name: editName, description: editDescription, completionDate: editDate });
        }
    }, [isEditing]);

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
            {isEditing && assignedBy === userEmail && <>
                <div className="flex flex-col gap-1 flex-1 pr-2">

                    <div className="flex flex-row items-center gap-2">
                        <input className="text-2xl font-semibold border-b border-gray-300 focus:outline-none focus:border-green-500 w-full" value={editName} onChange={(e) => setEditName(e.target.value)}/>
                        {assignedBy !== userEmail && <span>🏥</span>}
                    </div>

                    <input className="text-xs text-neutral-500 border-b border-gray-200 focus:outline-none focus:border-green-500" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description"/>

                    <input type="datetime-local" className="text-xs text-neutral-500 focus:outline-none focus:border-green-500" value={editDate} onChange={(e) => setEditDate(e.target.value)}/>

                </div>
            </>}
            {!isEditing && <>
                <div>
                    <h2 className={`text-2xl font-semibold ${taskCompleted ? 'line-through' : ''}`}>
                        {name} {assignedBy !== userEmail && <>| <GiHealthNormal className="inline" /></>}
                    </h2>
                    <div className='flex flex-row gap-2 text-xs text-neutral-500'>
                        <p> {description} </p>
                        {completionDate && 
                            <p className="text-xs text-neutral-500">| Due: {formatDate(completionDate)} </p>
                        }
                    </div>
                </div>
                <div onClick={onToggle} className={`h-inherit w-16 ${taskCompleted ? "bg-green-300" : "bg-gray-200"} flex justify-center items-center rounded-full cursor-pointer select-none`}>
                        <span className="text-4xl"> ✔️ </span>
                    </div>
            </>}
        </div>
    )
}