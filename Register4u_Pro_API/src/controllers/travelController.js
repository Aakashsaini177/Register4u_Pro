const TravelDetail = require("../models/TravelDetail");
const RoomAllotment = require("../models/RoomAllotment");
const DriverAllotment = require("../models/DriverAllotment");
const Hotel = require("../models/Hotel");
const HotelRoom = require("../models/HotelRoom");
const Driver = require("../models/Driver");
const {
  sendTravelAllotmentNotification,
} = require("../services/whatsappService");
const {
  ensurePortalAccount,
  updatePortalAccountStatus,
} = require("../services/portalAccountService");

// Generate unique visitor/travel ID
const generateVisitorId = async () => {
  try {
    const lastTravel = await TravelDetail.findOne().sort({ visitorId: -1 });

    let nextNumber = 1;
    if (lastTravel && lastTravel.visitorId) {
      const match = lastTravel.visitorId.match(/travel(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `travel${nextNumber}`;
  } catch (error) {
    console.error("Error generating travel ID:", error);
    return `travel${Date.now()}`;
  }
};

// Get all travel details
const getAllTravelDetails = async (req, res) => {
  try {
    const { type, date } = req.query;

    let query = {};
    if (type) {
      query.type = type;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.arrivalDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const travelDetails = await TravelDetail.find(query)
      .populate({
        path: "hotelAllotments",
        populate: [
          { path: "hotelId", model: "Hotel" },
          {
            path: "roomId",
            model: "HotelRoom",
            populate: { path: "categoryId", model: "HotelCategory" },
          },
        ],
      })
      .populate({
        path: "driverAllotments",
        populate: { path: "driverId", model: "Driver" },
      })
      .sort({ arrivalDate: 1, arrivalTime: 1 });

    console.log(`🔍 Found ${travelDetails.length} travel details`);
    travelDetails.forEach((td) => {
      console.log(
        `🚗 TravelDetail ${td.visitorId}: Drivers: ${td.driverAllotments?.length}, Hotels: ${td.hotelAllotments?.length}`
      );
      if (td.driverAllotments?.length > 0) {
        console.log("   Driver Details:", JSON.stringify(td.driverAllotments));
      }
    });

    // Transform to match old structure
    const transformedDetails = travelDetails.map((td) => {
      const obj = td.toObject();
      obj.id = obj._id;

      if (obj.hotelAllotments) {
        obj.hotelAllotments = obj.hotelAllotments.map((a) => ({
          ...a,
          hotel: a.hotelId,
          room: a.roomId,
        }));
      }

      if (obj.driverAllotments) {
        obj.driverAllotments = obj.driverAllotments.map((a) => ({
          ...a,
          driver: a.driverId,
        }));
      }

      return obj;
    });

    res.json({
      success: true,
      data: transformedDetails,
    });
  } catch (error) {
    console.error("Error fetching travel details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching travel details",
      error: error.message,
    });
  }
};

// Get travel detail by ID
const getTravelDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const travelDetail = await TravelDetail.findById(id)
      .populate({
        path: "hotelAllotments",
        populate: [
          { path: "hotelId", model: "Hotel" },
          {
            path: "roomId",
            model: "HotelRoom",
            populate: { path: "categoryId", model: "HotelCategory" },
          },
        ],
      })
      .populate({
        path: "driverAllotments",
        populate: { path: "driverId", model: "Driver" },
      });

    if (!travelDetail) {
      return res.status(404).json({
        success: false,
        message: "Travel detail not found",
      });
    }

    const obj = travelDetail.toObject();
    obj.id = obj._id;

    if (obj.hotelAllotments) {
      obj.hotelAllotments = obj.hotelAllotments.map((a) => ({
        ...a,
        hotel: a.hotelId,
        room: a.roomId,
      }));
    }

    if (obj.driverAllotments) {
      obj.driverAllotments = obj.driverAllotments.map((a) => ({
        ...a,
        driver: a.driverId,
      }));
    }

    res.json({
      success: true,
      data: obj,
    });
  } catch (error) {
    console.error("Error fetching travel detail:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching travel detail",
      error: error.message,
    });
  }
};

// Create travel detail
const createTravelDetail = async (req, res) => {
  try {
    const {
      visitorId,
      visitorName,
      mobileNumber,
      travelBy,
      flightTrainNo,
      fromLocation,
      toLocation,
      arrivalDate,
      arrivalTime,
      departureDate,
      departureTime,
      remarks,
      type,
    } = req.body;

    const finalVisitorId = visitorId || (await generateVisitorId());

    // Check if visitor already exists
    const existingTravel = await TravelDetail.findOne({
      visitorId: finalVisitorId,
    });

    if (existingTravel) {
      if (type === "departure") {
        // Update existing travel with departure details
        const updatedTravel = await TravelDetail.findOneAndUpdate(
          { visitorId: finalVisitorId },
          {
            departureDate,
            departureTime,
            remarks: remarks
              ? `${existingTravel.remarks || ""}\n${remarks}`
              : existingTravel.remarks,
            // Only update other fields if they are provided, otherwise keep existing
            ...(travelBy && { travelBy }),
            ...(flightTrainNo && { flightTrainNo }),
            ...(fromLocation && { fromLocation }),
            ...(toLocation && { toLocation }),
            status: "completed", // Mark as completed when departure is added? Or keep as active? Let's assume active unless logic changes.
          },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          message: "Departure details added successfully",
          data: { ...updatedTravel.toObject(), id: updatedTravel._id },
        });
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Visitor ID already exists. Please use 'Edit' to modify arrival details.",
        });
      }
    }

    const travelDetail = await TravelDetail.create({
      visitorId: finalVisitorId,
      visitorName,
      mobileNumber,
      travelBy,
      flightTrainNo,
      fromLocation,
      toLocation,
      arrivalDate,
      arrivalTime,
      departureDate,
      departureTime,
      remarks,
      type,
    });

    try {
      await ensurePortalAccount({
        role: "travel",
        loginId: finalVisitorId,
        entityId: travelDetail._id,
        defaultPassword: finalVisitorId,
      });
    } catch (err) {
      console.warn("Portal account creation failed:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Travel detail created successfully",
      data: { ...travelDetail.toObject(), id: travelDetail._id },
    });
  } catch (error) {
    console.error("Error creating travel detail:", error);
    res.status(500).json({
      success: false,
      message: "Error creating travel detail",
      error: error.message,
    });
  }
};

// Update travel detail
const updateTravelDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.visitorId) {
      delete updateData.visitorId;
    }

    const travelDetail = await TravelDetail.findById(id);
    if (!travelDetail) {
      return res.status(404).json({
        success: false,
        message: "Travel detail not found",
      });
    }

    await travelDetail.updateOne(updateData);

    if (updateData.status) {
      try {
        await updatePortalAccountStatus({
          role: "travel",
          entityId: travelDetail._id,
          status: updateData.status,
        });
      } catch (err) {
        console.warn("Portal account update failed:", err.message);
      }
    }

    const updatedDetail = await TravelDetail.findById(id);

    res.json({
      success: true,
      message: "Travel detail updated successfully",
      data: { ...updatedDetail.toObject(), id: updatedDetail._id },
    });
  } catch (error) {
    console.error("Error updating travel detail:", error);
    res.status(500).json({
      success: false,
      message: "Error updating travel detail",
      error: error.message,
    });
  }
};

// Delete travel detail
const deleteTravelDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const travelDetail = await TravelDetail.findById(id);
    if (!travelDetail) {
      return res.status(404).json({
        success: false,
        message: "Travel detail not found",
      });
    }

    await TravelDetail.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Travel detail deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting travel detail:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting travel detail",
      error: error.message,
    });
  }
};

// Get arrival guest list
const getArrivalGuestList = async (req, res) => {
  try {
    const { date } = req.query;

    let query = { type: "arrival" };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.arrivalDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const arrivals = await TravelDetail.find(query).sort({
      arrivalDate: 1,
      arrivalTime: 1,
    });

    res.json({
      success: true,
      data: arrivals.map((a) => ({ ...a.toObject(), id: a._id })),
    });
  } catch (error) {
    console.error("Error fetching arrival guest list:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching arrival guest list",
      error: error.message,
    });
  }
};

// Get departure guest list
const getDepartureGuestList = async (req, res) => {
  try {
    const { date } = req.query;

    let query = { type: "departure" };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.departureDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const departures = await TravelDetail.find(query).sort({
      departureDate: 1,
      departureTime: 1,
    });

    res.json({
      success: true,
      data: departures.map((d) => ({ ...d.toObject(), id: d._id })),
    });
  } catch (error) {
    console.error("Error fetching departure guest list:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching departure guest list",
      error: error.message,
    });
  }
};

// Send travel allotment notification to travel contact
const sendTravelNotification = async (req, res) => {
  try {
    const { visitorId } = req.params;

    const travelDetail = await TravelDetail.findOne({ visitorId });
    if (!travelDetail) {
      return res.status(404).json({
        success: false,
        message: "Travel detail not found",
      });
    }

    // Get hotel allotment details
    let hotelDetails = null;
    const roomAllotment = await RoomAllotment.findOne({ visitorId })
      .populate("hotelId")
      .populate({
        path: "roomId",
        populate: { path: "categoryId", model: "HotelCategory" },
      });

    if (roomAllotment) {
      hotelDetails = {
        hotelName: roomAllotment.hotelId.hotelName,
        hotelAddress: roomAllotment.hotelId.hotelAddress,
        contactNumber: roomAllotment.hotelId.contactNumber,
        roomNumber: roomAllotment.roomId.roomNumber,
        checkInDate: roomAllotment.checkInDate,
        checkOutDate: roomAllotment.checkOutDate,
      };
    }

    // Get driver allotment details
    let driverDetails = null;
    const driverAllotment = await DriverAllotment.findOne({
      visitorId,
    }).populate("driverId");

    if (driverAllotment) {
      driverDetails = {
        driverName: driverAllotment.driverId.driverName,
        contactNumber: driverAllotment.driverId.contactNumber,
        vehicleNumber: driverAllotment.driverId.vehicleNumber,
        vehicleType: driverAllotment.driverId.vehicleType,
        seater: driverAllotment.driverId.seater,
        pickupDate: driverAllotment.pickupDate,
        pickupTime: driverAllotment.pickupTime,
      };
    }

    // Send WhatsApp notification to travel contact
    // Send WhatsApp notification to travel contact
    if (travelDetail.mobileNumber) {
      await sendTravelAllotmentNotification(
        travelDetail.mobileNumber,
        travelDetail,
        hotelDetails,
        driverDetails
      );
    }

    res.json({
      success: true,
      message: "Travel notification sent successfully",
    });
  } catch (error) {
    console.error("Error sending travel notification:", error);
    res.status(500).json({
      success: false,
      message: "Error sending travel notification",
      error: error.message,
    });
  }
};

// Export Travel Report (Excel)
const exportTravelReport = async (req, res) => {
  try {
    const { type, date } = req.query;
    console.log(`[Export] Request received: type=${type}, date=${date}`);

    // Import inside try to catch missing module error
    let XLSX;
    try {
      XLSX = require("xlsx");
    } catch (err) {
      console.error("[Export] XLSX module missing:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server missing Excel module" });
    }

    let query = {};
    // Logic: If 'arrival', allow 'arrival' OR 'both'. If 'departure', allow 'departure' OR 'both'.
    if (type) {
      query.type = { $in: [type, "both"] };
    }

    // Date Filtering
    if (date && date !== "undefined" && date !== "null") {
      const startDate = new Date(date);
      if (!isNaN(startDate.getTime())) {
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        const dateField =
          type === "departure" ? "departureDate" : "arrivalDate";
        query[dateField] = { $gte: startDate, $lt: endDate };
      }
    }

    console.log("[Export] Query:", JSON.stringify(query));

    // Fetch Data with Population
    const travelDetails = await TravelDetail.find(query)
      .populate({
        path: "hotelAllotments",
        populate: [
          { path: "hotelId", model: "Hotel" },
          { path: "roomId", model: "HotelRoom" },
        ],
      })
      .populate({
        path: "driverAllotments",
        populate: { path: "driverId", model: "Driver" },
      })
      // Sorting
      .sort(
        type === "departure"
          ? { departureDate: 1, departureTime: 1 }
          : { arrivalDate: 1, arrivalTime: 1 }
      )
      // Use lean for performance since we map it manually
      .lean();

    console.log(`[Export] Found ${travelDetails.length} records.`);

    if (travelDetails.length === 0) {
      console.log("[Export] No records found, generating empty sheet.");
    }

    // Format Data for Excel
    const data = travelDetails.map((td, index) => {
      // Helper to format date
      const formatDate = (d) =>
        d ? new Date(d).toISOString().split("T")[0] : "";

      // Virtuals don't populate in .lean() automatically unless handled?
      // Wait! Mongoose .populate() works on .lean() result but virtuals are NOT populated?
      // CORRECT! Virtuals are NOT part of DB document.
      // If 'hotelAllotments' is a virtual, .populate() needs Mongoose Document or specific handling.
      // IF I USE .lean(), virtuals are lost unless I explicitly include them?
      // Actually, populate works on query level, so 'hotelAllotments' field is filled with array of objects.

      // Let's check structure:
      const hAllots =
        td.hotelAllotments && Array.isArray(td.hotelAllotments)
          ? td.hotelAllotments
          : [];
      const dAllots =
        td.driverAllotments && Array.isArray(td.driverAllotments)
          ? td.driverAllotments
          : [];

      // Get Hotel Info (First one if multiple)
      const hotel = hAllots[0]?.hotelId?.hotelName || "";
      const room = hAllots[0]?.roomId?.roomNumber || "";

      // Get Driver Info
      const driver = dAllots[0]?.driverId?.driverName || "";
      const vehicle = dAllots[0]?.driverId?.vehicleNumber || "";
      const driverContact = dAllots[0]?.driverId?.contactNumber || "";

      return {
        "S.No": index + 1,
        "Visitor Name": td.visitorName || "",
        Contact: td.mobileNumber || "",
        Mode: td.travelBy || "",
        "Flight/Train": td.flightTrainNo || "",
        From: td.fromLocation || "",
        To: td.toLocation || "",
        "Arrival Date": formatDate(td.arrivalDate),
        "Arr Time": td.arrivalTime || "",
        "Departure Date": formatDate(td.departureDate),
        "Dep Time": td.departureTime || "",
        "Assigned Hotel": hotel,
        "Room No": room,
        Driver: driver,
        "Driver Contact": driverContact,
        "Vehicle No": vehicle,
        Remarks: td.remarks || "",
      };
    });

    // Create Sheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Travel Report");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    console.log("[Export] Buffer generated, sending response...");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Travel_${type || "All"}_Report.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    console.error("[Export] CRASH:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllTravelDetails,
  getTravelDetailById,
  createTravelDetail,
  updateTravelDetail,
  deleteTravelDetail,
  getArrivalGuestList,
  getDepartureGuestList,
  sendTravelNotification,
  exportTravelReport,
};
