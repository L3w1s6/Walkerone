
import express from "express";
import mongoose from "mongoose";
const app = express();

const PORT = 8000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
