const mongoose = require("mongoose");

const roomCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    maxOccupancy: {
      type: Number,
      required: true,
      default: 2,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RoomCategory", roomCategorySchema);
