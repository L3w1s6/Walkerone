import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";


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
// delete user (D)
// add user as friend? (U)
// view user info (R)       done
// view user tasks (R)      
// add routes (C)       done
// view routes (R)      done
// delete routes (D)

// mongodb is in fact, a piece of crud
// i hate it.

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const URI = process.env.URI;
const PORT = process.env.PORT;

mongoose.connect(URI).then(() => {
    console.log("mongoDB databases connected");
    httpServer.listen(PORT, () => {
        console.log(`server running on http://localhost:${PORT}`);
    });
}).catch((error) => console.log(error));

// Create HTTP server and attach Socket.IO, allows us to use both express and socket on the same HTTP server
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE"]
    }
});


const doctorSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: String,
    userEmails: [String] // a doctor can be linked to many users, or none at all
})
const doctorModel = mongoose.model('doctors', doctorSchema);

const routeSchema = new mongoose.Schema({
    name: { type: String, required: true, default: "default" },
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
    username: { type: String, required: true } // link a route to a user
})
const routeModel = mongoose.model('routes', routeSchema);

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    creator: { type: String, required: true },
    assignedTo: { type: String, required: true }, // link a task to a user
    complete: Boolean
})
const taskModel = mongoose.model('tasks', taskSchema);

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: String,
    bio: String,
    pfp: String, //PLACEHOLDER
    restingHR: Number, // pull this from user on first start

    // from what i can tell if these are only associated with routes, not much reason to put them here unless something changes
    //caloriesBurnt: Number,
    //stepCount: Number,
    friends: [{ type: String }], // a user may have many friends, or none at all
})
const userModel = mongoose.model('users', userSchema);

// Sign Up / Register 
app.post('/api/register', async (req, res) => {
  try {
    console.log("NEW REGISTER REQUEST:", req.body); 
    const { username, email, password } = req.body;
    
    // Check if a username with this email already exists 
    const existingUser = await userModel.findOne({ email: email });
    
    if (existingUser) {
      console.log(" Registration failed: Email already in use.");
      return res.status(400).json({ message: "Email already in use." });
    }

    // Create the new user 
    const newUser = new userModel({ 
      username: username, 
      email: email, 
      password: password,
    });
    
    // Save it to the database
    await newUser.save(); 

    console.log(" New user saved to MongoDB successfully!");
    res.status(200).json({ message: "User created successfully!" });

  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// Login 
app.post('/api/login', async (req, res) => {
  try {
    console.log("NEW LOGIN REQUEST:", req.body);
    const { email, password } = req.body;
    
    const user = await userModel.findOne({ email: email });

    // If no user is found with that email, deny login
    if (!user) {
      console.log(" Login failed: User not found.");
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // If the user exists, check if the password matches
    if (user.password !== password) {
      console.log(" Login failed: Incorrect password.");
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Else the username + password matches
    console.log("✅ Login successful for:", email);
    
    // Send back a 200 (Success) and pass along the username so React can use it
    res.status(200).json({ 
      message: "Login successful!", 
      username: user.username 
    });

    res.status(200).json({ message: "Login endpoint reached!" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Get all doctors
app.get("/getDoctors", async (req, res) => {
    const doctorData = await doctorModel.find();
    res.json(doctorData);
});

// Get user data by username
// hmm, if profile sharing is implemented, only select fields should be returned when querying users which arent your own
app.get("/getUserData", async (req, res) => {
    // uncomment this in actual use
    //const {searchName} = req.body
    const searchName = "johnny silverhand" // PLACEHOLDER
    console.log(searchName)
    // test version
    const userData = await userModel.find({ username: searchName });
    res.json(userData);
});

// Get routes by username
app.get("/getRoutes", async (req, res) => {
    // uncomment this in actual use
    //const {searchName} = req.body
    const searchName = "garrytheprophet" // PLACEHOLDER
    console.log(searchName)

    // test version
    const userData = await routeModel.find({ username: searchName });
    res.json(userData);
});

// Add a new route
app.post("/addRoute", async (req, res) => {
    const { coordinates, startTime, endTime } = req.body;
    const route = new routeModel({
        // something weird with mongo means you dont need to define the id itself
        name: "a route",
        distance: 0, //PLACEHOLDER
        caloriesBurned: 0, //PLACEHOLDER
        elevationGain: 0, //PLACEHOLDER
        stepCount: 0, //PLACEHOLDER
        startTime: startTime,
        endTime: endTime,
        coordinates: coordinates,
        username: "garrytheprophet" //PLACEHOLDER
    });
    await route.save();
    res.json(route);
});

// Delete a route with the provided ID
app.delete("/deleteRoute/:id", async (req, res) => {
    const deletedRoute = await routeModel.findByIdAndDelete(req.params.id);
    if (!deletedRoute) {
        return res.json({ message: "Route not found, no route has been deleted" });
    }
    res.json(deletedRoute);
});

// Show routes by username (can be changed to email, vice versa, whatever we decide)
app.get("/showRoutesByUser/:username", async (req, res) => {
    const routes = await routeModel.find({ username: req.params.username });
    res.json(routes);
});

// Show and display routes by time 
app.get("/showRoutesByTime/:username", async (req, res) => {
    const { startDate, endDate } = req.query;
    const routes = await routeModel.find({
        username: req.params.username,
        startTime: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ startTime: -1 }); // Descending order (newest route first)
    res.json(routes);
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ msg: 'Hello from backend' });
});


io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // Add a new route
    socket.on("addRoute", async (data) => {
        const route = new routeModel({
            name: "a route",
            distance: 0, //PLACEHOLDER
            caloriesBurned: 0, //PLACEHOLDER
            elevationGain: 0, //PLACEHOLDER
            stepCount: 0, //PLACEHOLDER
            startTime: data.startTime,
            endTime: data.endTime,
            coordinates: data.coordinates,
            username: data.username
        });
        await route.save();
        socket.emit("routeAdded", { success: true, route });
    });

    // Delete a route
    socket.on("deleteRoute", async (data) => {
        const deletedRoute = await routeModel.findByIdAndDelete(data.id);
        if (!deletedRoute) {
            socket.emit("routeDeleted", { success: false, message: "Route not found" });
        } else {
            socket.emit("routeDeleted", { success: true, route: deletedRoute });
        }
    });

    // Get and display routes by username 
    socket.on("showRoutesByUser", async (data) => {
        const routes = await routeModel.find({ username: data.username });
        socket.emit("routesByUser", { success: true, routes });
    });

    // Get and display routes by time
    socket.on("showRoutesByTime", async (data) => {
        const routes = await routeModel.find({
            username: data.username,
            startTime: {
                $gte: data.startDate,
                $lte: data.endDate
            }
        }).sort({ startTime: -1 }); // Descending order (newest route first)
        socket.emit("routesByTime", { success: true, routes });
    });

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
    });
});
