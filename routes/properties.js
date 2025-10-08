// routes/propertyRoutes.js
import express from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties
} from "../controllers/propertyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Routes
router.route("/")
  .get(getProperties)
  .post(protect, upload.array("images", 5), createProperty);

// Route to get properties of the logged-in user
router.route("/my-properties")
  .get(protect, getMyProperties);

router.route("/:id")
  .get(getPropertyById)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

export default router;