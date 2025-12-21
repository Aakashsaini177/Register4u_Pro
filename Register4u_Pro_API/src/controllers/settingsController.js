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
