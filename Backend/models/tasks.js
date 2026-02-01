import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const taskSchema = new Schema({
    task: String ,
    description: String,
    creator: String, 
    assignedTo: String // link a task to a user
})

const task = model('task', taskSchema);
export default task;