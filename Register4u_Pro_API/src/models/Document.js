const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    documentNumber: {
      type: String,
    },
    DocumentType: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    image_back: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Document", documentSchema);
