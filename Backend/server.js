import express from "express";
import mongoose from "mongoose";
import mongodb, { MongoClient } from "mongodb";
import "dotenv/config";


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

const URI = process.env.URI
const PORT = process.env.PORT
const app = express();
const client = new MongoClient(URI);


async function connect() {
    try {
        await mongoose.connect(URI)
        console.log("connected to server")
    } catch (error) {
        console.log(error)
    }
}

// test function to verify the system works as intended
async function run() {
    // will probably need to be changed to take a function as a parameter, and run 
    try {
        await client.connect();

        // testing the connection to mongodb itself

        // the database itself (Walkerone)
        const db = client.db('sample_mflix');

        // the table you want to query (users, routes)
        const collection = db.collection('movies');

        // get the first value 
        const first = await collection.findOne();

        console.log(first);

    } finally {
        await client.close();
    }
}

// basic stuff for adding a user
async function addUser() {

    try {

        await client.connect();
        const db = client.db('Walkerone');
        const users = db.collection('users');

        const doc = { name: "foo fighter", email: "foofighters@music.com" };
        const result = await users.insertOne(doc);
        console.log(
            `A document was inserted with the _id: ${result.insertedId}`,
        );
    
    } finally {

    } await client.close()
}
await connect();
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
addUser().catch(console.error)