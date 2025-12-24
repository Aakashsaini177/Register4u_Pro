const mongoose = require("mongoose");

const accommodationRequirementSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String, // Custom Visitor ID
      required: true,
    },
    eventId: {
      type: String, // Custom Event ID
      required: true,
    },
    stayRequired: {
      type: Boolean,
      default: true,
    },
    roomCategory: {
      type: String, // e.g., 'Single', 'Double'
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Normal", "VIP", "VVIP"],
      default: "Normal",
    },
    status: {
      type: String,
      enum: ["Pending", "Allotted", "Cancelled"],
      default: "Pending",
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for dashboard filtering
accommodationRequirementSchema.index({ eventId: 1, status: 1 });

module.exports = mongoose.model(
  "AccommodationRequirement",
  accommodationRequirementSchema
);
