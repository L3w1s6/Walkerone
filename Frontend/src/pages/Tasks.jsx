import Task from "../components/Task"

export default function Tasks() {
    return(
        <div>
            <div className="flex flex-col gap-3 px-5">
                {/* placeholders for now, load tasks from db later */}
                <Task /> 
                <Task />
                <Task />
            </div>
        </div>
    )
}