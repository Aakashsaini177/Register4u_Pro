const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "portal_visibility", // Singleton identifier
      unique: true,
    },
    driverFields: {
      contact: { type: Boolean, default: true },
      vehicle: { type: Boolean, default: true },
      trips: { type: Boolean, default: true },
      salary: { type: Boolean, default: false },
    },
    hotelFields: {
      contact: { type: Boolean, default: true },
      roomCategory: { type: Boolean, default: true },
      allotments: { type: Boolean, default: true },
      pricing: { type: Boolean, default: false },
    },
    // Card Design Settings
    cardDesign: {
      // Image properties
      imageWidth: { type: Number, default: 100 },
      imageHeight: { type: Number, default: 100 },
      imageTopMargin: { type: Number, default: 20 },
      imageBottomMargin: { type: Number, default: 0 },
      imageLeftMargin: { type: Number, default: 20 },
      imageRightMargin: { type: Number, default: 0 },
      imageShape: { type: String, default: "circle" },
      
      // Detail box properties
      bottomContainerWidth: { type: Number, default: 250 },
      bottomContainerHeight: { type: Number, default: 150 },
      bottomContainerTopMargin: { type: Number, default: 10 },
      bottomContainerBottomMargin: { type: Number, default: 0 },
      bottomContainerLeftMargin: { type: Number, default: 30 },
      bottomContainerRightMargin: { type: Number, default: 0 },
      
      // Visitor name properties
      visitorNameWidth: { type: Number, default: 200 },
      visitorNameHeight: { type: Number, default: 30 },
      visitorNameFontSize: { type: Number, default: 18 },
      visitorNameMarginTop: { type: Number, default: 140 },
      visitorNameMarginBottom: { type: Number, default: 0 },
      visitorNameMarginRight: { type: Number, default: 0 },
      visitorNameMarginLeft: { type: Number, default: 20 },
      visitorNameColor: { type: String, default: "#FFFFFF" },
      visitorNameAlign: { type: String, default: "left" },
      visitorNameFontFamily: { type: String, default: "Arial" },
      
      // Company name properties
      companyNameWidth: { type: Number, default: 200 },
      companyNameHeight: { type: Number, default: 25 },
      companyNameFontSize: { type: Number, default: 14 },
      companyNameMarginTop: { type: Number, default: 170 },
      companyNameMarginBottom: { type: Number, default: 0 },
      companyNameMarginRight: { type: Number, default: 0 },
      companyNameMarginLeft: { type: Number, default: 20 },
      companyNameColor: { type: String, default: "#FFFFFF" },
      companyNameAlign: { type: String, default: "left" },
      companyNameFontFamily: { type: String, default: "Arial" },
      
      // Barcode properties
      barcodeImageWidth: { type: Number, default: 200 },
      barcodeImageHeight: { type: Number, default: 60 },
      barcodeImageMarginTop: { type: Number, default: 10 },
      barcodeImageMarginRight: { type: Number, default: 0 },
      barcodeImageMarginBottom: { type: Number, default: 10 },
      barcodeImageMarginLeft: { type: Number, default: 25 },
      barcodeType: { type: String, default: "barcode" },
      showBarcode: { type: Boolean, default: true },
      
      // QR Code properties
      qrCodeWidth: { type: Number, default: 100 },
      qrCodeHeight: { type: Number, default: 100 },
      qrCodeTop: { type: Number, default: 10 },
      qrCodeLeft: { type: Number, default: 50 },
      showQRCode: { type: Boolean, default: false },
      
      // Background and print settings
      backgroundUrl: { type: String, default: "" },
      printWidth: { type: Number, default: 89 },
      printHeight: { type: Number, default: 127 },
      printUnit: { type: String, default: "mm" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
