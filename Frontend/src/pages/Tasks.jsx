import Task from "../components/Task";

export default function Tasks() {
    return(
        <div>
            <div className="flex flex-col px-5 divide-y divide-gray-200">
                {/* placeholders for now, load tasks from db later */}
                <Task/> 
                <Task/>
                <Task/>
            </div>
        </div>
    )
}