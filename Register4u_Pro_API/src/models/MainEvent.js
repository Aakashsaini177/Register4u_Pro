const mongoose = require("mongoose");

const mainEventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    location_url: {
      type: String,
      required: true,
    },
    event_description: {
      type: String,
      required: true,
    },
    expected_visitor: {
      type: String,
      required: true,
    },
    org_id: {
      type: String,
      required: true,
    },
    event_Cordinator: {
      type: Object, // Storing JSON as Object
      required: true,
    },
    org_emp: {
      type: Object, // Storing JSON as Object
      required: true,
    },
    event_type: {
      type: Object, // Storing JSON as Object
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("MainEvent", mainEventSchema);
