import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
    email: {String, required: true},
    password:  {type: String, required: true},
    username: String,
    bio: String,
    pfp: String,  //PLACEHOLDER
   
    restingHR: Int32, // pull this from user on first start
    // query database each time biomarkers are viewed, to see steps and calories burnt from walks which happened that day
    caloriesBurnt: Int32, 
    stepCount: Int32,
  
    friends: [{type: string}], // a user may have many friends, or none at all
})


const user = model('user', userSchema);
export default user;
