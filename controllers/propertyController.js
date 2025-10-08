import Property from "../models/Property.js";
import { v2 as cloudinary } from "cloudinary";

// Create new property
export const createProperty = async (req, res) => {
  try {
    // Cloudinary automatically gives public image URLs in req.files
    const imageUrls = (req.files || []).map(
      (file) => file.path || file.secure_url || file.url
    );

    const property = await Property.create({
      ...req.body,
      images: imageUrls,
      createdBy: req.user._id,
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all properties
export const getProperties = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, type, bedrooms, sortBy, page = 1, limit = 6 } = req.query;

    const query = {};

    // Search by location or title
    if (location) {
      query.$or = [
        { location: { $regex: location, $options: "i" } },
        { title: { $regex: location, $options: "i" } },
      ];
    }

    // Filter by type
    if (type) query.type = type;

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Bedrooms
    if (bedrooms) query.bedrooms = Number(bedrooms);

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sortBy === "price_low") sortOption = { price: 1 };
    if (sortBy === "price_high") sortOption = { price: -1 };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(query);

    const properties = await Property.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      properties,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get properties created by the logged-in user
export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ createdBy: req.user._id });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("createdBy", "name email");
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update property
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // If new images uploaded, replace or merge them
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((f) => f.path || f.secure_url || f.url);
      property.images = [...property.images, ...newImageUrls];
    }

    Object.assign(property, req.body);
    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete property (optional: also delete Cloudinary images)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // OPTIONAL: delete images from Cloudinary
    if (property.images && property.images.length > 0) {
      for (const imageUrl of property.images) {
        try {
          const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract ID
          await cloudinary.uploader.destroy(`properties/${publicId}`);
        } catch (err) {
          console.warn("Failed to delete image:", imageUrl);
        }
      }
    }

    await property.deleteOne();
    res.json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
