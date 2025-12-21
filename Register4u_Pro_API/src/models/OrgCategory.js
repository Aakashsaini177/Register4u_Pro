const mongoose = require("mongoose");

const orgCategorySchema = new mongoose.Schema(
  {
    category: {
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

module.exports = mongoose.model("OrgCategory", orgCategorySchema);
