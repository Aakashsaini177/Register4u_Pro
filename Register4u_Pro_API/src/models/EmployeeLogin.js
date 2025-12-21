const mongoose = require("mongoose");

const employeeLoginSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    randomPassword: {
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

module.exports = mongoose.model("EmployeeLogin", employeeLoginSchema);
