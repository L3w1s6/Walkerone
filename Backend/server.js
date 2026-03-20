import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const URI = process.env.URI;
const PORT = process.env.PORT;
// bcrypt password hashing
const saltRounds = 10;
const activeRoutes = {};
mongoose.set('sanitizeFilter', true);
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
  completionDate: Date,
  completed: Boolean,
  email: String,
  assignedBy: String
})
const taskModel = mongoose.model('tasks', taskSchema);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: String,
  bio: String,
  pfp: String, //PLACEHOLDER
  friendReq: [{ type: String }],
  restingHR: Number, // pull this from user on first start

  // from what i can tell if these are only associated with routes, not much reason to put them here unless something changes
  //caloriesBurnt: Number,
  //stepCount: Number,
  friends: [{ type: String }], // a user may have many friends, or none at all
  doctors: [{ type: String }], // why not, a user can have many doctors
  doctorReq: [{ type: String }]
})
const userModel = mongoose.model('users', userSchema);



// Get user data by username or email
app.get("/getUserData", async (req, res) => {
  try {
    const searchName = req.query.searchName;
    const searchEmail = req.query.searchEmail;

    if (!searchName && !searchEmail) {
      console.log(searchName)
      console.log(searchEmail)
      return res.status(400).json({ message: "Please provide a username or email." });
    }

    // Return a single object instead of an array
    const userData = await userModel.findOne(
      searchEmail
        ? { email: searchEmail }
        : { username: searchName }
    );

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the found user back to React
    res.status(200).json(userData);

  } catch (error) {
    console.error("Lookup error:", error);
    res.status(500).json({ message: "Server error during lookup" });
  }
});

/* - USER FUNCTIONS - */

// Sign Up / Register 
app.post('/user-register', async (req, res) => {
  try {
    console.log("NEW USER REGISTER REQUEST:", req.body);
    const { username, email, password } = req.body;
    let hashed;

    // Check if a username with this email already exists 
    const existingUser = await userModel.findOne({ email: email });

    if (existingUser) {
      console.log(" Registration failed: Email already in use.");
      return res.status(400).json({ message: "Email already in use." });
    }

    bcrypt.hash(password, saltRounds, function (err, hashedpassword) {
      if (err) {
        console.error(err);
        return;
      }
      hashed = hashedpassword
      console.log("printing hashed")
      console.log(hashed);

      // create the new user 
      const newUser = new userModel({
        email: email,
        password: hashed,
        username: username,
        bio: "",
        pfp: "",
        friendReq: [],
        restingHR: 0,
        friends: []
      });

      // save it to the database
      newUser.save();
      // somethings not right, its printing the debugging messages last, even though it should happen before it starts saving
      // it does save anyway, but its definetely a bit weird its doing that

    });


    console.log(" New user saved to MongoDB successfully!");
    res.status(200).json({ message: "User created successfully!" });

  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// Login 
app.post('/user-login', async (req, res) => {
  try {
    console.log("NEW USER LOGIN REQUEST:", req.body);
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email });

    if (!user) {
      console.log(" Login failed: User not found.");
      return res.status(401).json({ message: "Invalid email or password." });
    }

    console.log(password);
    console.log(user.password);

    bcrypt.compare(password.trim(), user.password, function (err, result) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error during login." });
      }

      if (result) {
        console.log("Password is correct!");
        console.log("Login successful for:", email);
        return res.status(200).json({
          message: "Login successful!",
          username: user.username
        });
      } else {
        console.log("Wrong password");
        return res.status(401).json({ message: "Invalid email or password." });
      }
    });

  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});
// Get user email for editing bio
app.get('/api/user/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    const user = await userModel.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back the user data (including the bio!)
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user bio or pfp
app.put('/api/user/update', async (req, res) => {
  try {
    const { email, bio, pfp } = req.body;

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (pfp !== undefined) updateData.pfp = pfp;

    // Find the user by email and update them
    const updatedUser = await userModel.findOneAndUpdate(
      { email: email },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(` Profile updated in cloud for: ${email}`);
    res.status(200).json({ message: "Profile updated!", user: updatedUser });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
});


/* - DOCTOR LOGIN/REGISTRATION - */

app.post('/doctor-login', async (req, res) => {
  try {
    console.log("NEW DOCTOR LOGIN REQUEST:", req.body);
    const { email, password } = req.body;

    const doctor = await doctorModel.findOne({ email: email });

    if (!doctor) {
      console.log(" Login failed: User not found.");
      return res.status(401).json({ message: "Invalid email or password." });
    }

    console.log(password);
    console.log(doctor.password);

    bcrypt.compare(password.trim(), doctor.password, function (err, result) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error during login." });
      }

      if (result) {
        console.log("Password is correct!");
        console.log("Login successful for:", email);
        return res.status(200).json({
          message: "Login successful!",
          username: doctor.username
        });
      } else {
        console.log("Wrong password");
        return res.status(401).json({ message: "Invalid email or password." });
      }
    });

  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

app.post('/doctor-register', async (req, res) => {
  try {
    console.log("NEW DOCTOR REGISTER REQUEST:", req.body);
    const { username, email, password } = req.body;
    let hashed;

    // Check if a username with this email already exists 
    const existingDoctor = await doctorModel.findOne({ email: email });

    if (existingDoctor) {
      console.log(" Registration failed: Email already in use.");
      return res.status(400).json({ message: "Email already in use." });
    }

    bcrypt.hash(password, saltRounds, function (err, hashedpassword) {
      if (err) {
        console.error(err);
        return;
      }
      hashed = hashedpassword
      console.log("printing hashed")
      console.log(hashed);

      // create the new user 
      const newDoctor = new doctorModel({
        email: email,
        password: hashed,
        username: username,
        userEmails: []
      });

      // save it to the database
      newDoctor.save();
    });

    console.log(" New doctor saved to MongoDB successfully!");
    res.status(200).json({ message: "doctor created successfully!" });

  } catch (error) {
    console.error("Error saving doctor:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});


/* - FRIEND SYSTEM - */

// Send a friend request
app.post('/api/user/friend-request', async (req, res) => {
  try {
    const { senderEmail, targetUsername } = req.body;

    // Find the person you want to add
    const targetUser = await userModel.findOne({ username: targetUsername });
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // Find the sender to get your username
    const senderUser = await userModel.findOne({ email: senderEmail });
    if (!senderUser) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Checking that the original user isnt accounted for
    if (targetUser.username === senderUser.username) {
      return res.status(400).json({ message: "You cannot add yourself!" });
    }

    // Check if you are already friends, or if a request is already pending
    if (targetUser.friends.includes(senderUser.username)) {
      return res.status(400).json({ message: "You are already friends!" });
    }
    if (targetUser.friendReq.includes(senderUser.username)) {
      return res.status(400).json({ message: "Friend request already sent!" });
    }

    // Push your username into their friendReq array
    targetUser.friendReq.push(senderUser.username);
    await targetUser.save(); // Save the updated target user to MongoDB

    console.log(` Friend request sent from ${senderUser.username} to ${targetUsername}`);
    res.status(200).json({ message: "Friend request sent successfully!" });

  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Server error while sending request" });
  }
});



// ACCEPT REQUEST 
app.post('/api/user/accept-request', async (req, res) => {
  try {
    const { userEmail, senderUsername } = req.body;

    const currentUser = await userModel.findOne({ email: userEmail });
    const senderUser = await userModel.findOne({ username: senderUsername });

    if (!currentUser || !senderUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the sender from the current users friend list
    currentUser.friendReq = currentUser.friendReq.filter(name => name !== senderUsername);

    // Add each other to the friends list
    if (!currentUser.friends.includes(senderUsername)) {
      currentUser.friends.push(senderUsername);
    }
    if (!senderUser.friends.includes(currentUser.username)) {
      senderUser.friends.push(currentUser.username);
    }

    // Save both updated documents
    await currentUser.save();
    await senderUser.save();

    console.log(`${currentUser.username} accepted ${senderUsername}'s request!`);
    res.status(200).json({ message: "Friend request accepted!" });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ message: "Server error while accepting request" });
  }
});

// DECLINE REQUEST
app.post('/api/user/decline-request', async (req, res) => {
  try {
    const { userEmail, senderUsername } = req.body;

    const currentUser = await userModel.findOne({ email: userEmail });
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // Remove the sender from the friend list
    currentUser.friendReq = currentUser.friendReq.filter(name => name !== senderUsername);
    await currentUser.save();

    console.log(` ${currentUser.username} declined ${senderUsername}'s request.`);
    res.status(200).json({ message: "Friend request declined." });
  } catch (error) {
    console.error("Error declining request:", error);
    res.status(500).json({ message: "Server error while declining request" });
  }
});

/* - DOCTOR/PATIENT FUNCTIONS - */

// let a doctor add a user
app.post('/addUser', async (req, res) => {
  try {
    const { senderEmail, targetUsername } = req.body;

    // Find the person you want to add
    const targetUser = await userModel.findOne({ username: targetUsername });
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // Find the sender to get your username
    const senderDoctor = await doctorModel.findOne({ email: senderEmail });
    if (!senderDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if you are already friends, or if a request is already pending
    if (targetUser.doctors.includes(senderDoctor.username)) {
      return res.status(400).json({ message: "Already added patient" });
    }
    if (targetUser.doctorReq.includes(senderDoctor.username)) {
      return res.status(400).json({ message: "Patient request already sent" });
    }

    targetUser.doctorReq.push(senderDoctor.username);
    await targetUser.save(); // Save the updated target user to MongoDB

    console.log(` Patient request sent from ${senderDoctor.username} to ${targetUsername}`);
    res.status(200).json({ message: "Friend request sent successfully!" });

  } catch (error) {
    console.error("Error sending Patient request:", error);
    res.status(500).json({ message: "Server error while sending request" });
  }
});

// ACCEPT REQUEST 
app.post('/acceptDoctors', async (req, res) => {
  try {
    const { userEmail, senderUsername } = req.body;

    const currentUser = await userModel.findOne({ email: userEmail });
    const senderDoctor = await doctorModel.findOne({ username: senderUsername });

    if (!currentUser || !senderDoctor) {
      return res.status(404).json({ message: "User not found" });
    }

    // Allow for these to be empty arrays
    currentUser.doctorReq = currentUser.doctorReq || [];
    currentUser.doctors = currentUser.doctors || [];
    senderDoctor.userEmails = senderDoctor.userEmails || [];

    // Remove the sender from the current users friend list
    currentUser.doctorReq = currentUser.doctorReq.filter(name => name !== senderUsername);

    // Add each other to the friends list
    if (!currentUser.doctors.includes(senderUsername)) {
      currentUser.doctors.push(senderUsername);
    }
    if (!senderDoctor.userEmails.includes(currentUser.email)) {
      senderDoctor.userEmails.push(currentUser.email);
    }

    // Save both updated documents
    await currentUser.save();
    await senderDoctor.save();

    console.log(`${currentUser.username} accepted ${senderUsername}'s request`);
    res.status(200).json({ message: "Doctor request accepted" });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ message: "Server error while accepting request" });
  }
});

// DECLINE REQUEST
app.post('/declineDoctors', async (req, res) => {
  try {
    const { userEmail, senderUsername } = req.body;

    const currentUser = await userModel.findOne({ email: userEmail });
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    currentUser.doctorReq = currentUser.doctorReq || [];

    // Remove the sender from the friend list
    currentUser.doctorReq = currentUser.doctorReq.filter(name => name !== senderUsername);
    await currentUser.save();

    console.log(` ${currentUser.username} declined ${senderUsername}'s request`);
    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error declining request:", error);
    res.status(500).json({ message: "Server error while declining request" });
  }
});

// REMOVE ASSIGNED USER
app.post('/removeUser', async (req, res) => {
  try {
    const { doctorEmail, userEmail } = req.body;
    const doctor = await doctorModel.findOne({ email: doctorEmail });
    const user = await userModel.findOne({ email: userEmail });

    doctor.userEmails = (doctor.userEmails || []).filter((email) => email !== userEmail);
    user.doctors = (user.doctors || []).filter((doctorUsername) => doctorUsername !== doctor.username);
    await Promise.all([doctor.save(), user.save()]);

    // Remove any tasks the doctor assigned to the user 
    const deletedTasks = await taskModel.deleteMany({
      email: userEmail,
      assignedBy: doctorEmail
    });

    console.log(`Removed ${userEmail} from ${doctorEmail}'s assigned users`);
    res.status(200).json({
      message: "Assigned user removed",
    });
  } catch (error) {
    console.error("Error removing assigned user:", error);
    res.status(500).json({ message: "Server error while removing assigned user" });
  }
});


// REMOVE FRIEND
app.post('/api/user/remove-friend', async (req, res) => {
  try {
    const { userEmail, friendUsername } = req.body;

    const currentUser = await userModel.findOne({ email: userEmail });
    const friendUser = await userModel.findOne({ username: friendUsername });

    if (!currentUser || !friendUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from both friends lists (User who removed the friend and the former friend, both of their pages)
    currentUser.friends = currentUser.friends.filter(name => name !== friendUsername);
    friendUser.friends = friendUser.friends.filter(name => name !== currentUser.username);

    await currentUser.save();
    await friendUser.save();

    console.log(`Removed ${friendUsername} from friends`);
    res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ message: "Server error while trying to remove friend" });
  }
});


// Get routes by username
app.get("/getRoutes", async (req, res) => {

  try {
    const { username } = "req.body"
    console.log(username)

    const userData = await routeModel.find({ username: username });
    res.json(userData);
  } catch (err) {
    console.log(err)
  }
});

app.get("/getFriendRoutes", async (req, res) => {
  try {
    const { username } = "req.body"
    // or change it to email if its different
    const user = await userModel.find({ username: username });
    const friendRoutes = await routeModel.find({ username: { $in: user.friends } });
    res.json(friendRoutes);
  } catch (err) {
    console.log(err)
  }
});

// this was a test function, not quite sure why its actually being used
// since theres no point in checking the user is a doctor first... since users cant add doctors anyway
// Get all doctors
app.get("/getDoctors", async (req, res) => {
  const doctorData = await doctorModel.find();
  res.json(doctorData);
});

// Add a new route
app.post("/addRoute", async (req, res) => {
  const { coordinates, startTime, endTime, email } = req.body;
  console.log(email)
  const user = await userModel.find({ email: email });
  console.log(user)
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
    username: user[0]["username"] //PLACEHOLDER
  });
  await route.save();
  res.json(route);
});


// doctors should be able to use this one as well to assign a task to a patient
// the passed in email should be different depending on the patient
app.post("/addTask", async (req, res) => {
  const { name, description, completionDate, email, assignedBy } = req.body;
  const user = await userModel.find({ email: email });

  console.log("adding task for")
  console.log(email)
  console.log(user)
  console.log(user.username)
  const task = new taskModel({

    name: name,
    description: description,
    completionDate: completionDate,
    completed: false,
    email: email,
    assignedBy: assignedBy
  });
  await task.save();
  res.json(task);
});



// Update a task when edited or completion is toggled
app.patch("/updateTask/:id", async (req, res) => {
  try {
    const { completed, name, description, completionDate } = req.body;
    const updates = {}; // Array of updates to be changed
    if (completed !== undefined) updates.completed = completed;
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (completionDate !== undefined) updates.completionDate = completionDate;
    const task = await taskModel.findByIdAndUpdate( // Find task by id and update it with the updates array
      req.params.id,
      updates,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    console.log(err);
  }

});

app.get("/getRoutesPeriod", async (req, res) => {
  try {
    const {email, start, end} = req.query

    // offset = 1 for today, 7 for a week if you want
    const user = await userModel.findOne({email: email});
    if (!user) {return res.status(404).json({message: "User not found"});}

    //get routes data
    const routesData = await routeModel.find({
      username: user.username,
      startTime: mongoose.trusted({//date range (trusted so doesn't error by trying to change format stuff to string)
        $gte: start,
        $lte: end
      })
    }).select("-_id stepCount caloriesBurned");//excluding _id, only specific fields

    //calc totals
    var totalSteps = 0, totalCalories = 0;
    routesData.forEach((v) => {
      totalSteps += v.stepCount;
      totalCalories += v.caloriesBurned;
    })

    //arrange data to send
    const data = {
      steps: [totalSteps, Math.max(10000 - totalSteps, 0)],//temp, remaining doesn't exist?
      calories: [totalCalories, Math.max(2500 - totalCalories, 0)]//temp, remaining doesn't exist?
    }
    console.log(data)

    //response
    res.json(data)
  } catch (err) {
    console.log(err)
  }
});

// badge ideas
// total days walked
// total calories burnt
// total step count
// longest distance covered

app.get("/showStatsByUser", async (req, res) => {

  try {
  const { username } = req.query
  const res = await routeModel.find({ username: username});
  let stepTotal = 0;
  let calorieTotal = 0;
  let distanceTotal = 0;

  res.forEach( doc => {
    stepTotal = stepTotal + doc.stepTotal;
    calorieTotal = calorieTotal + doc.calorieTotal;
    distanceTotal = distanceTotal + doc.distanceTotal;
  });

  res.json({stepTotal, calorieTotal, distanceTotal});
} catch (err) {
  console.log(err)
}
});


// possibly implement longest streak




// Get all tasks for the logged in user
app.get("/getTasks", async (req, res) => {
  try {
    const { email } = req.query
    const tasks = await taskModel.find({ email: email });
    res.json(tasks);
  } catch (err) {
    console.log(err)
  }

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

// for data exporting
app.get("/getAllData", async (req, res) => { 
  const { username} = req.query;
  const routes = await routeModel.find({ username: username });
  const users = await userModel.find({ username: username });
  res.json(routes + users);
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


  // Receive live coordinates and send back real-time stats
  socket.on("liveCoordinate", (data) => {
    const { username, coordinate } = data;

    if (!activeRoutes[username]) {
      activeRoutes[username] = {
        coordinates: [],
        startTime: new Date().toISOString() // Converts date to an int, just easier in mongodb searching and sorting
      };
    }

    activeRoutes[username].coordinates.push(coordinate);
    /*
    numCoords is used to count how many coordinates there are (lat, long) then by how many coordinates there are, 
    that amount gets calculated, so if 3 sets of coordinates then its 3 x 0.1 = 0.3km, 0.3 * 1377 = 413 steps and then 0.3 x 60 = 18 cals burned
     */
    // Calculate current stats in real-time, Calculated for average height (5'9)
    const numCoords = activeRoutes[username].coordinates.length;
    const distance = (numCoords * 0.1); // in km
    const steps = Math.round(distance * 1377); // 1377 steps per km
    const calories = Math.round(distance * 60); // cals burned per km

    console.log(`${username}: ${numCoords} coords, ${steps} steps`);

    // Send current stats back to frontend
    socket.emit("liveStats", {
      steps: steps,
      distance: distance,
      calories: calories,
      points: numCoords
    });
  });

  // Save route when user stops
  socket.on("saveRoute", async (data) => {
    const { username } = data;

    if (!activeRoutes[username]) {
      return socket.emit("routeSaved", { success: false, message: "No data" });
    }

    const routeData = activeRoutes[username];
    const numCoords = routeData.coordinates.length;

    //Calculated for average height (5'9)
    const distance = (numCoords * 0.1); // in km 
    const steps = Math.round(distance * 1377); // 1377 steps per km 
    const calories = Math.round(distance * 60); // cals burned per km

    const route = new routeModel({
      name: "a route",
      distance: distance,
      caloriesBurned: calories,
      elevationGain: 0,
      stepCount: steps,
      startTime: routeData.startTime,
      endTime: new Date().toISOString(),
      coordinates: routeData.coordinates,
      username: username
    });

    await route.save();
    delete activeRoutes[username];

    console.log(`${username}: ${distance.toFixed(2)}km, ${steps} steps`);
    socket.emit("routeSaved", { success: true, route });
  });


  // Add route
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