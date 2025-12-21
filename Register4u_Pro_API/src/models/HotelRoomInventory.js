const mongoose = require("mongoose");

const hotelRoomInventorySchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomCategory",
      required: true,
    },
    totalRooms: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one inventory record per hotel+category
hotelRoomInventorySchema.index({ hotelId: 1, categoryId: 1 }, { unique: true });

module.exports = mongoose.model("HotelRoomInventory", hotelRoomInventorySchema);
