const Driver = require("../models/Driver");
const DriverAllotment = require("../models/DriverAllotment");
const TravelDetail = require("../models/TravelDetail");
const RoomAllotment = require("../models/RoomAllotment");
const Hotel = require("../models/Hotel");
const HotelRoom = require("../models/HotelRoom");
const HotelCategory = require("../models/HotelCategory");
const { sendDriverAllotmentSMS } = require("../services/smsService");
const {
  sendDriverAllotmentNotification,
} = require("../services/whatsappService");
const {
  ensurePortalAccount,
  updatePortalAccountStatus,
  deletePortalAccount,
} = require("../services/portalAccountService");

// Generate unique driver ID
const generateDriverId = async () => {
  try {
    // Sort by createdAt to ensure we get the absolute latest driver
    const lastDriver = await Driver.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastDriver && lastDriver.driverId) {
      const match = lastDriver.driverId.match(/DR(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `DR${String(nextNumber).padStart(3, "0")}`;
  } catch (error) {
    console.error("Error generating driver ID:", error);
    return `DR${Date.now()}`;
  }
};

// Get all drivers
const getAllDrivers = async (req, res) => {
  try {
    const { status, isEmployee } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }
    if (isEmployee !== undefined) {
      query.isEmployee = isEmployee === "true";
    }

    const drivers = await Driver.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: drivers.map((d) => ({ ...d.toObject(), id: d._id })),
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching drivers",
      error: error.message,
    });
  }
};

// Get driver by ID
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findById(id).populate("allotments");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.json({
      success: true,
      data: { ...driver.toObject(), id: driver._id },
    });
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching driver",
      error: error.message,
    });
  }
};

// Create new driver
const createDriver = async (req, res) => {
  try {
    console.log("📝 Creating driver with body:", req.body);
    console.log("📂 Uploaded files:", req.files);

    const {
      driverName,
      vehicleNumber,
      contactNumber,
      secondaryContactNumber,
      seater,
      vehicleType,
      isEmployee,
      remarks,
    } = req.body;

    // Handle file paths
    let driverPhoto = "";
    let aadharCard = "";
    let licensePhoto = "";
    let rcPhoto = "";

    if (req.files) {
      if (req.files.driverPhoto) {
        driverPhoto = `uploads/${req.files.driverPhoto[0].filename}`;
      }
      if (req.files.aadharCard) {
        aadharCard = `uploads/${req.files.aadharCard[0].filename}`;
      }
      if (req.files.licensePhoto) {
        licensePhoto = `uploads/${req.files.licensePhoto[0].filename}`;
      }
      if (req.files.rcPhoto) {
        rcPhoto = `uploads/${req.files.rcPhoto[0].filename}`;
      }
    }

    const driverId = await generateDriverId();

    const driver = await Driver.create({
      driverId,
      driverName,
      vehicleNumber,
      contactNumber,
      secondaryContactNumber,
      seater: parseInt(seater) || 4,
      vehicleType,
      driverPhoto,
      aadharCard,
      licensePhoto,
      rcPhoto,
      isEmployee: isEmployee === "true" || isEmployee === true, // Handle string 'true' from FormData
      remarks,
    });

    try {
      await ensurePortalAccount({
        role: "driver",
        loginId: driver.driverId,
        entityId: driver._id,
        defaultPassword: driver.driverId,
      });
    } catch (err) {
      console.warn("Portal account creation failed:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: { ...driver.toObject(), id: driver._id },
    });
  } catch (error) {
    console.error("Error creating driver:", error);
    res.status(500).json({
      success: false,
      message: "Error creating driver",
      error: error.message,
    });
  }
};

// Update driver
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    console.log("📝 Updating driver with body:", req.body);
    console.log("📂 Uploaded files:", req.files);

    if (updateData.driverId) {
      delete updateData.driverId;
    }

    const driver = await Driver.findById(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.driverPhoto) {
        updateData.driverPhoto = `uploads/${req.files.driverPhoto[0].filename}`;
      }
      if (req.files.aadharCard) {
        updateData.aadharCard = `uploads/${req.files.aadharCard[0].filename}`;
      }
      if (req.files.licensePhoto) {
        updateData.licensePhoto = `uploads/${req.files.licensePhoto[0].filename}`;
      }
      if (req.files.rcPhoto) {
        updateData.rcPhoto = `uploads/${req.files.rcPhoto[0].filename}`;
      }
    }

    // Handle boolean conversion for FormData
    if (updateData.isEmployee !== undefined) {
      updateData.isEmployee =
        updateData.isEmployee === "true" || updateData.isEmployee === true;
    }

    // Handle seater conversion
    if (updateData.seater) {
      updateData.seater = parseInt(updateData.seater) || 4;
    }

    await driver.updateOne(updateData);

    if (updateData.status) {
      try {
        await updatePortalAccountStatus({
          role: "driver",
          entityId: driver._id,
          status: updateData.status,
        });
      } catch (err) {
        console.warn("Portal account update failed:", err.message);
      }
    }

    const updatedDriver = await Driver.findById(id);

    res.json({
      success: true,
      message: "Driver updated successfully",
      data: { ...updatedDriver.toObject(), id: updatedDriver._id },
    });
  } catch (error) {
    console.error("Error updating driver:", error);
    res.status(500).json({
      success: false,
      message: "Error updating driver",
      error: error.message,
    });
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findById(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    await Driver.findByIdAndDelete(id);
    await DriverAllotment.deleteMany({ driverId: id });

    // Also delete the associated portal account
    await deletePortalAccount({ role: "driver", entityId: id });

    res.json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting driver:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting driver",
      error: error.message,
    });
  }
};

// Get driver allotments
const getDriverAllotments = async (req, res) => {
  try {
    const { driverId, status, date } = req.query;

    let query = {};
    if (driverId) {
      query.driverId = driverId;
    }
    if (status) {
      query.status = status;
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.pickupDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const allotments = await DriverAllotment.find(query)
      .populate("driverId")
      .sort({ pickupDate: 1, pickupTime: 1 });

    res.json({
      success: true,
      data: allotments.map((a) => ({
        ...a.toObject(),
        id: a._id,
        driver: a.driverId, // Map populated driverId to 'driver'
      })),
    });
  } catch (error) {
    console.error("Error fetching driver allotments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching driver allotments",
      error: error.message,
    });
  }
};

// Create driver allotment
const createDriverAllotment = async (req, res) => {
  try {
    const {
      driverId,
      visitorId,
      visitorName,
      visitorNumber,
      pickupLocation,
      dropLocation,
      pickupDate,
      pickupTime,
      dropDate,
      dropTime,
      remarks,
    } = req.body;

    console.log("📝 Creating Driver Allotment:", req.body);

    if (!driverId || !visitorId) {
      console.warn("❌ Missing required fields for driver allotment");
      return res.status(400).json({
        success: false,
        message: "Driver ID and Visitor ID are required",
      });
    }

    const allotment = await DriverAllotment.create({
      driverId,
      visitorId,
      visitorName,
      visitorNumber,
      pickupLocation,
      dropLocation,
      pickupDate,
      pickupTime,
      dropDate,
      dropTime,
      remarks,
    });
    console.log("✅ Driver Allotment Created:", allotment._id);

    // Send WhatsApp notifications
    try {
      const travelDetail = await TravelDetail.findOne({ visitorId });
      const driver = await Driver.findById(driverId);

      // Get hotel details if room is allotted
      let hotelDetails = null;
      const roomAllotment = await RoomAllotment.findOne({ visitorId })
        .populate("hotelId")
        .populate({
          path: "roomId",
          populate: {
            path: "categoryId",
            model: "HotelCategory",
          },
        });

      if (roomAllotment) {
        hotelDetails = {
          hotelName: roomAllotment.hotelId?.hotelName,
          hotelAddress: roomAllotment.hotelId?.hotelAddress,
          contactNumber: roomAllotment.hotelId?.contactNumber,
          roomNumber: roomAllotment.roomId?.roomNumber,
          checkInDate: roomAllotment.checkInDate,
          checkOutDate: roomAllotment.checkOutDate,
        };
      }

      // Send WhatsApp notification to driver
      if (driver.contactNumber) {
        await sendDriverAllotmentNotification(
          driver.contactNumber,
          travelDetail,
          hotelDetails
        );
      }

      // Send SMS to visitor
      await sendDriverAllotmentSMS(
        visitorName,
        visitorNumber,
        driver.driverName,
        driver.vehicleNumber,
        pickupDate,
        pickupTime
      );

      // Update allotment to mark notifications as sent
      await allotment.updateOne({ smsSent: true, whatsappSent: true });
    } catch (notificationError) {
      console.error("Notification sending failed:", notificationError);
      // Don't fail the entire operation if notifications fail
    }

    res.status(201).json({
      success: true,
      message: "Driver allotted successfully and notifications sent",
      data: { ...allotment.toObject(), id: allotment._id },
    });
  } catch (error) {
    console.error("Error creating driver allotment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating driver allotment",
      error: error.message,
    });
  }
};

// Get driver daily report
const getDriverDailyReport = async (req, res) => {
  try {
    const { date, driverId } = req.query;

    let query = {};
    if (driverId) {
      query.driverId = driverId;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.pickupDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const report = await DriverAllotment.find(query)
      .populate("driverId")
      .sort({ pickupDate: 1, pickupTime: 1 });

    // Calculate summary statistics
    const summary = {
      totalTrips: report.length,
      completedTrips: report.filter((trip) => trip.status === "completed")
        .length,
      inProgressTrips: report.filter((trip) => trip.status === "in_progress")
        .length,
      scheduledTrips: report.filter((trip) => trip.status === "scheduled")
        .length,
      cancelledTrips: report.filter((trip) => trip.status === "cancelled")
        .length,
    };

    res.json({
      success: true,
      data: {
        report: report.map((r) => ({
          ...r.toObject(),
          id: r._id,
          driver: r.driverId,
        })),
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching driver daily report:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching driver daily report",
      error: error.message,
    });
  }
};

// Get driver work report (aggregated by driver)
const getDriverWorkReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateMatch = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Set to end of day

      dateMatch.pickupDate = {
        $gte: start,
        $lte: end,
      };
    }

    const report = await DriverAllotment.aggregate([
      {
        $match: dateMatch,
      },
      {
        $group: {
          _id: "$driverId",
          totalTrips: { $sum: 1 },
          completedTrips: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledTrips: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          scheduledTrips: {
            $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "drivers",
          localField: "_id",
          foreignField: "_id",
          as: "driverInfo",
        },
      },
      {
        $unwind: "$driverInfo",
      },
      {
        $project: {
          _id: 1,
          driverName: "$driverInfo.driverName",
          vehicleNumber: "$driverInfo.vehicleNumber",
          contactNumber: "$driverInfo.contactNumber",
          totalTrips: 1,
          completedTrips: 1,
          cancelledTrips: 1,
          scheduledTrips: 1,
        },
      },
      {
        $sort: { totalTrips: -1 },
      },
    ]);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error fetching driver work report:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching driver work report",
      error: error.message,
    });
  }
};

// Update driver allotment
const updateDriverAllotment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`📝 Updating Driver Allotment ${id} with:`, updateData);

    const allotment = await DriverAllotment.findById(id);

    if (!allotment) {
      return res.status(404).json({
        success: false,
        message: "Driver allotment not found",
      });
    }

    await allotment.updateOne(updateData);

    // Fetch updated allotment with populated data
    const updatedAllotment = await DriverAllotment.findById(id).populate(
      "driverId"
    );

    res.json({
      success: true,
      message: "Driver allotment updated successfully",
      data: {
        ...updatedAllotment.toObject(),
        id: updatedAllotment._id,
        driver: updatedAllotment.driverId,
      },
    });
  } catch (error) {
    console.error("Error updating driver allotment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating driver allotment",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverAllotments,
  createDriverAllotment,
  getDriverDailyReport,
  getDriverWorkReport,
  updateDriverAllotment,
};
