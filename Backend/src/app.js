import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "node:http";
import dotenv from 'dotenv';
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);

const io = connectToSocket(server);

app.set("port", process.env.PORT || 3000);

const allowedOrigins = [
  'http://localhost:5173',
  'https://synccall-frontend.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// ✅ Mount Routes
app.use("/api/v1/users", userRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("✅ Connected to MongoDB");

    server.listen(app.get("port"), () => {
      console.log("🚀 Server listening on port " + app.get("port"));
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
};

start();
