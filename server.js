import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import propertyRoutes from "./routes/properties.js";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(express.json());

// CORS setup
const allowedOrigins = [
  'https://dreamhomes3.netlify.app', // your frontend
  'http://localhost:3000'            // dev frontend
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman / mobile
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: The origin ${origin} is not allowed`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Serve local uploads only in development
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
}

// Routes
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), "client/build")));

  // Use "/*" instead of "*" to avoid PathError
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "client", "build", "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
