import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// things which need to be modelled

// users
// email, password (FR 1.1)
// username, bio, pfp (FR 1.2)
// friends (list of users) (FR 1.3)
// biomarkers (steps, heart rate, calories burnt) (FR 2.1)
// although, how do you estimate heart rate? cant really use online data sets, some research has to be done
// list of routes (FR 4.1-3, relationship to routes)
// list of tasks (FR 4.5, relationship to doctors)

// routes 
// route name, description, category (FR 4.3)
// route "markers"
// if color changing is implemented, markers should be placed each time the color changes, makes it easier to identify "sections"
// probably would need this also for elevation? not sure
// time elapsed, distance, elevation (FR 2.7)

// tasks (or personal activities)
// name
// date 

//doctors
// name, password, email, list of tasks (relationship to users)

// cant be bothered finding requirement numbers for the rest of these
// will stick bcrypt and that stuff on once the basic stuff is figured out

// Create, Read, Update, Delete (CRUD) operations

// add users (C)
// edit user information (U)
// delete user information (D)
// add user as friend? (U)
// view user info (R)
// view user tasks (R)
// add routes (C)
// view routes (R)
// delete routes (D)

// mongodb is in fact, a piece of crud
// i hate it.

const app = express();
app.use(express.json());
app.use(cors())
dotenv.config();

const URI = process.env.URI
const PORT = process.env.PORT

mongoose.connect(URI).then(() => {
    console.log("mongoDB databases connected")
    app.listen(PORT, () => {
        console.log(`server running on http://localhost:${PORT}`)
    })
})
    .catch((error) => console.log(error));

// THESE ALL USE TO BE IN SEPERATE FILES BUT I GOT FED UP SO EVERYTHING IS GOING IN HERE FOR NOW

const doctorSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: String,
    userEmails: [String] // a doctor can be linked to many users, or none at all
})
const doctorModel = mongoose.model('doctors', doctorSchema);

const routeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    distance: Number,
    caloriesBurned: Number,
    elevationGain: Number,
    stepCount: Number,
    startTime: String,
    endTime: String,
    coordinates: [
        {
            lat: Number,
            long: Number,
            timestamp: Date
        }
    ],
    email: { type: String, required: true } // link a route to a user
})
const routeModel = mongoose.model('routes', routeSchema);

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    creator: { type: String, required: true },
    assignedTo: { type: String, required: true } // link a task to a user
})
const taskModel = mongoose.model('tasks', taskSchema);

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: String,
    bio: String,
    pfp: String,  //PLACEHOLDER

    restingHR: Number, // pull this from user on first start
    // query database each time biomarkers are viewed, to see steps and calories burnt from walks which happened that day
    caloriesBurnt: Number,
    stepCount: Number,

    friends: [{ type: String }], // a user may have many friends, or none at all
})
const userModel = mongoose.model('users', userSchema);

//example to see all doctors
app.get("/getDoctors", async (req, res) => {
    const doctorData = await doctorModel.find();
    res.json(doctorData);
});

// add a new route
app.post("/addRoute", async (req, res) => {
    const {id, coordinates, startTime, endTime} = req.body;
    const route = new routeModel(
        {
            _id: id,
            distance: 0, //PLACEHOLDER
            caloriesBurned: 0, //PLACEHOLDER
            elevationGain: 0, //PLACEHOLDER
            stepCount: 0, //PLACEHOLDER
            startTime: String,
            endTime: String,
            coordinates: coordinates,
            email: "garrytheprophet@gmail.com" //PLACEHOLDER
        }
    )
    await route.save();
    res.json(newRoute)
});

// Delete a route with the provided ID
app.delete("/deleteRoute/:id", async (req, res) => {
    const deletedRoute = await routeModel.findByIdAndDelete(req.params.id);
    if (!deletedRoute) {
        res.json({message: "Route not found, no route has been deleted"});
    }
    res.json(deletedRoute);
});

// Find a router by searching the email of the user
app.get("/showRoutesByUser/:email", async (req, res) => {
    const routes = await routeModel.find({ email: req.params.email });
    res.json(routes);
});

app.get('/test/', function (req, res, next) {
  res.json({msg: 'Hello'})
})