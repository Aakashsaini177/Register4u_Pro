const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    deals: {
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

module.exports = mongoose.model("Deal", dealSchema);
