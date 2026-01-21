
import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

const URI = process.env.URI
const PORT = process.env.PORT
const app = express();

async function connect() {
    try {
        await mongoose.connect(URI)
        console.log("connected to server")
    } catch (error) {
        console.log(error)
    }
}

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
