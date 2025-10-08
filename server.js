import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js"
import propertyRoutes from "./routes/properties.js";
import path from "path";

dotenv.config();
const app = express();

// Middleware
// Allow requests from your frontend
app.use(cors({
  origin: 'https://dreamhomes3.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());


// Connect DB
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
