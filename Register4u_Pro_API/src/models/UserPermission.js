const mongoose = require("mongoose");

const userPermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["employee", "volunteer"],
      unique: true,
    },
    permissions: {
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

module.exports = mongoose.model("UserPermission", userPermissionSchema);
