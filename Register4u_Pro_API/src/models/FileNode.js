const mongoose = require("mongoose");

const fileNodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["folder", "file"],
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileNode",
      default: null, // Null means root level
    },
    // For files only
    url: {
      type: String,
    },
    size: {
      type: Number, // In bytes
      default: 0,
    },
    mimeType: {
      type: String,
    },
    // Hierarchy helper
    path: {
      type: String, // e.g., "uploads/photos"
      default: "",
    },
    folderCount: {
      type: Number, // Cached count of children (optional but useful)
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookups and ensuring unique names inside a folder
fileNodeSchema.index({ parentId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("FileNode", fileNodeSchema);
