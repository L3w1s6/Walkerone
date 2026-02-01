import mongoose from 'mongoose';
const { Schema, model } = mongoose;


const routeSchema = new Schema({
    name: String,
    distance: Number,
    caloriesBurned: Number,
    elevationGain: Number, 
    stepCount: Number,
    waypoint: [String],
    // assuming heartrate isnt getting tracked, and is shown to the user at start time
    email: String // link a route to a user
})

const route = model('route', routeSchema);
export default route;