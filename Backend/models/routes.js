import mongoose from 'mongoose';
const { Schema, model } = mongoose;


const routeSchema = new Schema({
    name: {String, required: true},
    distance: Double,
    caloriesBurned: Int32,
    elevationGain: Int32, 
    stepCount: Int32,
    waypoint: [{type: String}],
    // assuming heartrate isnt getting tracked, and is shown to the user at start time
    email: {String, required: true} // link a route to a user
})

const route = model('route', routeSchema);
export default route;