const mongoose = require("mongoose");

const eventHotelSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate hotel mappings for the same event
eventHotelSchema.index({ eventId: 1, hotelId: 1 }, { unique: true });

module.exports = mongoose.model("EventHotel", eventHotelSchema);
