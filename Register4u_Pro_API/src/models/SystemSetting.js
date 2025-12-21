const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "portal_visibility", // Singleton identifier
      unique: true,
    },
    driverFields: {
      contact: { type: Boolean, default: true },
      vehicle: { type: Boolean, default: true },
      trips: { type: Boolean, default: true },
      salary: { type: Boolean, default: false },
    },
    hotelFields: {
      contact: { type: Boolean, default: true },
      roomCategory: { type: Boolean, default: true },
      allotments: { type: Boolean, default: true },
      pricing: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
