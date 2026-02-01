import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
    email: String,
    password: String,
    username: String,
    bio: String,
    pfp: String,  //PLACEHOLDER
   
    restingHR: Number, // pull this from user on first start
    // query database each time biomarkers are viewed, to see steps and calories burnt from walks which happened that day
    caloriesBurnt: Number, 
    stepCount: Number,
  
    friends: [{type: String}], // a user may have many friends, or none at all
})


const user = model('user', userSchema);
export default user;
