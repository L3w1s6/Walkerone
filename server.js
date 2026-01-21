
import express from "express";
import mongoose from "mongoose";
const app = express();

const PORT = 8000;

const uri = "mongodb+srv://WalkeroneDev:uAlVnEwVFDa5G4EX@walkerone.hqlvq8e.mongodb.net/?appName=Walkerone"
async function connect(){
    try {
    await mongoose.connect(uri)
    console.log("successfully connected to mongoDB")
    }catch(error){
        console.log(error)
    }

}

connect();
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
