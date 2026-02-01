import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const taskSchema = new Schema({
    task: {type: String, required: true},
    description: String,
    creator:  {type: String, required: true}, 
    assignedTo: {type: String, required: true} // link a task to a user
})

const task = model('task', taskSchema);
export default task;