const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: { type: String }, // Name of the invitee/entity (e.g. "CISF")
    contact: { type: String }, // Contact number
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Assuming creators are Admins/Employees. Adjust if Employee model is separate and used here.
      required: true,
    },
    type: {
      type: String,
      enum: ["SINGLE", "MULTI"],
      default: "SINGLE",
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "USED"],
      default: "ACTIVE",
    },
    prefillData: {
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
      hostName: String,
      purpose: String,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    maxUses: {
      type: Number,
      default: 1, // Only relevant if type is MULTI, or can be used for enforcement
    },
  },
  { timestamps: true }
);

// Index for fast lookup

module.exports = mongoose.model("Invite", inviteSchema);
