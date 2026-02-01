import mongoose from 'mongoose';
const { Schema, model } = mongoose;


const doctorSchema = new Schema({
    email: {String, required: true},
    password:  {type: String, required: true},
    username: String,
    userEmails: [String] // a doctor can be linked to many users, or none at all
})

const doctor = model('doctor', doctorSchema);
export default doctor;