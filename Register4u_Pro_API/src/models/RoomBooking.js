const mongoose = require("mongoose");

const roomBookingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelCategory",
      required: true,
    },
    occupancy: {
      type: Number,
      required: true,
      default: 1, // Stores the Pax count (1, 2, 3, etc.)
    },
    date: {
      type: Date,
      required: true,
    },
    roomsBooked: {
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

// Index for efficient querying by event and date
roomBookingSchema.index(
  { eventId: 1, hotelId: 1, categoryId: 1, date: 1, occupancy: 1 },
  { unique: true }
);

module.exports = mongoose.model("RoomBooking", roomBookingSchema);
