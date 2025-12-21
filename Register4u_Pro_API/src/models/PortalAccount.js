const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const portalAccountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["hotel", "driver", "travel"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "roleModel", // Dynamic reference based on role
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for dynamic reference model
portalAccountSchema.virtual("roleModel").get(function () {
  if (this.role === "hotel") return "Hotel";
  if (this.role === "driver") return "Driver";
  if (this.role === "travel") return "TravelDetail";
  return null;
});

// Method to compare password
portalAccountSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Pre-save hook to hash password if modified
portalAccountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("PortalAccount", portalAccountSchema);
