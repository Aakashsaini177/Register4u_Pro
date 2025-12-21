const mongoose = require("mongoose");

const dashboardSchema = new mongoose.Schema(
  {
    Employee: {
      type: String,
      required: true,
    },
    Volunteer: {
      type: String,
      required: true,
    },
    Event: {
      type: String,
      required: true,
    },
    Org: {
      type: String,
      required: true,
    },
    OrgCategory: {
      type: String,
      required: true,
    },
    Visitors: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Dashboard", dashboardSchema);
