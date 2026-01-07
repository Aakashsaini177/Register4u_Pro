const { SystemSetting } = require("../models");
const { asyncHandler } = require("../middleware/errorHandler");

// Get settings (create default if not exists)
exports.getPortalSettings = asyncHandler(async (req, res) => {
  try {
    let settings = await SystemSetting.findOne({ key: "portal_visibility" });

    if (!settings) {
      settings = await SystemSetting.create({
        key: "portal_visibility",
        driverFields: {
          contact: true,
          vehicle: true,
          trips: true,
          salary: false,
        },
        hotelFields: {
          contact: true,
          roomCategory: true,
          allotments: true,
          pricing: false,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get Settings Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch settings" });
  }
});

// Update settings
exports.updatePortalSettings = asyncHandler(async (req, res) => {
  try {
    const { driverFields, hotelFields } = req.body;

    const settings = await SystemSetting.findOneAndUpdate(
      { key: "portal_visibility" },
      {
        $set: {
          driverFields,
          hotelFields,
        },
      },
      { new: true, upsert: true } // Create if missing
    );

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update settings" });
  }
});

// Get card design settings
exports.getCardDesignSettings = asyncHandler(async (req, res) => {
  try {
    let settings = await SystemSetting.findOne({ key: "portal_visibility" });

    if (!settings || !settings.cardDesign) {
      // Create default card design settings
      const defaultCardDesign = {
        imageWidth: 100,
        imageHeight: 100,
        imageTopMargin: 20,
        imageBottomMargin: 0,
        imageLeftMargin: 20,
        imageRightMargin: 0,
        imageShape: "circle",
        bottomContainerWidth: 250,
        bottomContainerHeight: 150,
        bottomContainerTopMargin: 10,
        bottomContainerBottomMargin: 0,
        bottomContainerLeftMargin: 30,
        bottomContainerRightMargin: 0,
        visitorNameWidth: 200,
        visitorNameHeight: 30,
        visitorNameFontSize: 18,
        visitorNameMarginTop: 140,
        visitorNameMarginBottom: 0,
        visitorNameMarginRight: 0,
        visitorNameMarginLeft: 20,
        visitorNameColor: "#FFFFFF",
        visitorNameAlign: "left",
        visitorNameFontFamily: "Arial",
        companyNameWidth: 200,
        companyNameHeight: 25,
        companyNameFontSize: 14,
        companyNameMarginTop: 170,
        companyNameMarginBottom: 0,
        companyNameMarginRight: 0,
        companyNameMarginLeft: 20,
        companyNameColor: "#FFFFFF",
        companyNameAlign: "left",
        companyNameFontFamily: "Arial",
        barcodeImageWidth: 200,
        barcodeImageHeight: 60,
        barcodeImageMarginTop: 10,
        barcodeImageMarginRight: 0,
        barcodeImageMarginBottom: 10,
        barcodeImageMarginLeft: 25,
        barcodeType: "barcode",
        showBarcode: true,
        qrCodeWidth: 100,
        qrCodeHeight: 100,
        qrCodeTop: 10,
        qrCodeLeft: 50,
        showQRCode: false,
        backgroundUrl: "",
        printWidth: 89,
        printHeight: 127,
        printUnit: "mm",
      };

      if (!settings) {
        settings = await SystemSetting.create({
          key: "portal_visibility",
          cardDesign: defaultCardDesign,
        });
      } else {
        settings = await SystemSetting.findOneAndUpdate(
          { key: "portal_visibility" },
          { $set: { cardDesign: defaultCardDesign } },
          { new: true }
        );
      }
    }

    res.status(200).json({
      success: true,
      data: settings.cardDesign,
    });
  } catch (error) {
    console.error("Get Card Design Settings Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch card design settings" });
  }
});

// Update card design settings
exports.updateCardDesignSettings = asyncHandler(async (req, res) => {
  try {
    const cardDesignData = req.body;

    console.log("📝 Updating card design settings:", cardDesignData);

    const settings = await SystemSetting.findOneAndUpdate(
      { key: "portal_visibility" },
      {
        $set: {
          cardDesign: cardDesignData,
        },
      },
      { new: true, upsert: true } // Create if missing
    );

    console.log("✅ Card design settings updated successfully");

    res.status(200).json({
      success: true,
      message: "Card design settings updated successfully",
      data: settings.cardDesign,
    });
  } catch (error) {
    console.error("❌ Update Card Design Settings Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update card design settings" });
  }
});
