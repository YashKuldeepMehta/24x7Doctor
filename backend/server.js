import express from "express"
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { setServers } from "node:dns/promises";
import connectDB from "./configs/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js"

setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Test Route
app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use('/api/auth', authRouter)

// MongoDB connection
await connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));