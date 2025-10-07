import express from "express";
import multer from "multer";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer setup (local storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname),
});

const upload = multer({ storage });

// Routes
router.route("/")
  .get(getProperties)
  .post(protect, upload.array("images", 5), createProperty);

router.route("/:id")
  .get(getPropertyById)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

export default router;
