const mongoose = require("mongoose");

const backImageSchema = new mongoose.Schema(
  {
    backGroundImage: {
      type: String, // Storing as string since it might be a filename or JSON string
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("BackImage", backImageSchema);
