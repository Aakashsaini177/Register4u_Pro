const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // Assuming all users are in Admin collection for now, based on authController
    // Not always present (public requests or system actions)
    required: false,
  },
  action: {
    type: String, // e.g., "LOGIN", "CREATE_VISITOR", "DELETE_EMPLOYEE"
    required: true,
  },
  module: {
    type: String, // e.g., "AUTH", "VISITOR", "EMPLOYEE"
    required: true,
  },
  details: {
    type: String, // Human readable details
  },
  metadata: {
    type: Object, // Structured data about the change (optional)
  },
  ipAddress: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
