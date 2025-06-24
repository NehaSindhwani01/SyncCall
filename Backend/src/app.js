import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "node:http";
import dotenv from 'dotenv'
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/userRoutes.js"

dotenv.config();

const app = express();
const server = createServer(app);

const io = connectToSocket(server);

app.set("port" , process.env.PORT || 3000)

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));



app.get("/", (req, res) => {
  res.send("working");
});

app.use("/api/v1/users" , userRoutes)


const start = async() =>{
    try {
      await mongoose.connect(process.env.MONGO_DB_URL);
      console.log("Connected to MongoDB");

      server.listen(app.get("port"), () => {
        console.log("Server is listening on port " + app.get("port"));
      });
  } catch (error) {
      console.error("MongoDB connection failed:", error.message);
  }
}

start();
