const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    companyId: {
      type: String,
      unique: true,
    },
    address: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    pincode: {
      type: String,
    },
    GSIJN: {
      type: String,
    },
    category: {
      type: String,
      default: "General",
    },
    gst_certificate: {
      type: String, // Path to uploaded file
    },
    contact: {
      type: String,
    },
    email: {
      type: String,
    },
    logo: {
      type: String,
    },
    website: {
      type: String, // Optional website field
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Company", companySchema);
