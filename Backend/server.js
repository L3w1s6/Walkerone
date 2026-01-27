import express from "express";
import mongoose from "mongoose";
import mongodb, { MongoClient } from "mongodb";
import "dotenv/config";

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

async function run() {

try {

await client.connect();

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

connect();
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
run().catch(console.error);