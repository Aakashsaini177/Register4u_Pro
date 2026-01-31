const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    placeCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // Assigned employees
    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for assigned employees count
placeSchema.virtual("employeeCount").get(function () {
  return this.assignedEmployees ? this.assignedEmployees.length : 0;
});

// Pre-save middleware to generate place code
placeSchema.pre("save", async function (next) {
  if (!this.placeCode) {
    let isUnique = false;
    while (!isUnique) {
      // Generate random 4 digit number
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const code = `PLC${randomNum}`;

      // Check if code exists
      const existing = await mongoose.models.Place.findOne({
        placeCode: code,
      });
      if (!existing) {
        this.placeCode = code;
        isUnique = true;
      }
    }
  }
  next();
});

// Indexes for better performance
placeSchema.index({ name: 1 });
placeSchema.index({ status: 1 });
placeSchema.index({ assignedEmployees: 1 });

module.exports = mongoose.model("Place", placeSchema);
