const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
    },
    name: {
      type: String,
    },
    aadharNumber: {
      type: String,
    },
    gender: {
      type: String,
    },
    contact: {
      type: String,
    },
    email: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
    },
    pincode: {
      type: String,
    },
    area: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    ticket: {
      type: String,
    },
    category: {
      type: String,
    },
    hostess: {
      type: String,
    },
    professions: {
      type: String,
    },
    companyName: {
      type: String,
    },
    compCode: {
      type: String,
    },
    gstNo: {
      type: String,
    },
    photo: {
      type: String,
    },
    documents: {
      aadharFront: String,
      aadharBack: String,
      panFront: String,
      panBack: String,
    },
    oldPhoto: {
      type: String,
    },
    QRCode: {
      type: String,
    },
    eventId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["registered", "checked-in"],
      default: "registered",
    },
    checkInTime: {
      type: Date,
    },
    paymentDetails: {
      receiptNo: {
        type: String,
      },
      amount: {
        type: Number,
      },
    },
    registrationSource: {
      type: String,
      enum: [
        "ADMIN_PANEL",
        "INVITE_LINK",
        "PUBLIC_FORM",
        "KIOSK",
        "BULK_IMPORT",
      ],
      default: "ADMIN_PANEL",
    },
    inviteCode: {
      type: String, // Store code for textual search
    },
    inviteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invite", // Reference to Invite model
    },
    isCardPrinted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Visitor", visitorSchema);
