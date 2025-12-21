const Hotel = require("../models/Hotel");
const HotelCategory = require("../models/HotelCategory");
const HotelRoom = require("../models/HotelRoom");
const RoomAllotment = require("../models/RoomAllotment");
const TravelDetail = require("../models/TravelDetail");
const { sendRoomAllotmentSMS } = require("../services/smsService");
const {
  sendHotelAllotmentNotification,
  sendTravelAllotmentNotification,
} = require("../services/whatsappService");
const {
  ensurePortalAccount,
  updatePortalAccountStatus,
} = require("../services/portalAccountService");
const Visitor = require("../models/Visitor");
const RoomBooking = require("../models/RoomBooking");

// Helper: Update Booking Counts (Sync Allotment -> Report)
const updateBookingCounts = async (
  eventId,
  hotelId,
  categoryId,
  checkIn,
  checkOut,
  change = 1
) => {
  try {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const dateArray = [];

    // Loop dates: CheckIn (inclusive) -> CheckOut (exclusive)
    // Standard hotel logic: If check-in 21st, check-out 23rd = 2 nights (21st, 22nd)
    let currentDate = new Date(startDate);
    while (currentDate < endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (dateArray.length === 0) return; // Immediate checkout or invalid

    for (const date of dateArray) {
      // Format date to YYYY-MM-DD to ignore time part for matching if needed,
      // but RoomBooking uses Date type. Let's assume midnight UTC or standardized.
      // Best to use startOfDay.
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      await RoomBooking.updateOne(
        {
          eventId: eventId,
          hotelId: hotelId,
          categoryId: categoryId,
          date: d,
          occupancy: 1, // Default to 1 for now, or fetch from somewhere?
          // RoomAllotment doesn't capture occupancy count explicitly, usually 1 room = 1 unit usage.
          // But existing schema has occupancy field. We'll default to 1.
        },
        { $inc: { roomsBooked: change } },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error("Failed to sync Booking Report:", err);
  }
};

// Get all hotels
const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate("categories")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: hotels.map((h) => ({ ...h.toObject(), id: h._id })),
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hotels",
      error: error.message,
    });
  }
};

// Get hotel by ID
const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id)
      .populate({
        path: "categories",
        populate: {
          path: "rooms",
        },
      })
      .populate({
        path: "allotments",
        populate: {
          path: "roomId", // Assuming roomId ref is HotelRoom
          model: "HotelRoom", // Explicitly specifying model just in case
        },
      });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // Transform allotments to match old structure where 'room' was populated
    const hotelObj = hotel.toObject();
    if (hotelObj.allotments) {
      hotelObj.allotments = hotelObj.allotments.map((a) => {
        // Mongoose populates 'roomId' field with the room object.
        // Old code expected 'room' field.
        return { ...a, room: a.roomId };
      });
    }

    res.json({
      success: true,
      data: { ...hotelObj, id: hotel._id },
    });
  } catch (error) {
    console.error("Error fetching hotel:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hotel",
      error: error.message,
    });
  }
};

// Generate unique hotel ID
const generateHotelId = async () => {
  try {
    const lastHotel = await Hotel.findOne().sort({ hotelId: -1 }); // Sort by hotelId descending

    let nextNumber = 1;
    if (lastHotel && lastHotel.hotelId) {
      const match = lastHotel.hotelId.match(/hotel(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return `hotel${nextNumber}`;
  } catch (error) {
    console.error("Error generating hotel ID:", error);
    return `hotel${Date.now()}`;
  }
};

// Create new hotel
const createHotel = async (req, res) => {
  try {
    const {
      hotelName,
      contactPerson,
      contactNumber,
      hotelAddress,
      status,
      categories,
    } = req.body;

    // Generate unique hotel ID
    const hotelId = await generateHotelId();

    const hotel = await Hotel.create({
      hotelId,
      hotelName,
      contactPerson,
      contactNumber,
      hotelAddress,
      status: status || "active",
    });

    try {
      await ensurePortalAccount({
        role: "hotel",
        loginId: hotel.hotelId,
        entityId: hotel._id,
        defaultPassword: hotel.hotelId,
      });
    } catch (err) {
      console.warn("Portal account creation failed:", err.message);
    }

    // Create categories and rooms
    if (categories && categories.length > 0) {
      for (const category of categories) {
        const hotelCategory = await HotelCategory.create({
          hotelId: hotel._id,
          categoryName: category.categoryName,
          occupancy: category.occupancy,
          numberOfRooms: category.numberOfRooms,
        });

        // Create rooms for this category
        if (category.roomNumbers && category.roomNumbers.length > 0) {
          for (const roomNumber of category.roomNumbers) {
            await HotelRoom.create({
              hotelId: hotel._id,
              categoryId: hotelCategory._id,
              roomNumber,
            });
          }
        }
      }
    }

    const createdHotel = await Hotel.findById(hotel._id).populate({
      path: "categories",
      populate: {
        path: "rooms",
      },
    });

    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: { ...createdHotel.toObject(), id: createdHotel._id },
    });
  } catch (error) {
    console.error("Error creating hotel:", error);
    res.status(500).json({
      success: false,
      message: "Error creating hotel",
      error: error.message,
    });
  }
};

// Update hotel
const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      hotelName,
      contactPerson,
      contactNumber,
      hotelAddress,
      status,
      categories,
    } = req.body;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // Update hotel basic information
    await hotel.updateOne({
      hotelName,
      contactPerson,
      contactNumber,
      hotelAddress,
      status: status || "active",
    });

    try {
      await updatePortalAccountStatus({
        role: "hotel",
        entityId: hotel._id,
        status: status || "active",
      });
    } catch (err) {
      console.warn("Portal account update failed:", err.message);
    }

    // Handle categories update
    if (categories && categories.length > 0) {
      // Delete existing categories and rooms
      // First find categories to get their IDs
      const existingCategories = await HotelCategory.find({ hotelId: id });
      const categoryIds = existingCategories.map((c) => c._id);

      // Delete rooms associated with these categories
      await HotelRoom.deleteMany({ categoryId: { $in: categoryIds } });
      // Delete categories
      await HotelCategory.deleteMany({ hotelId: id });

      // Create new categories and rooms
      for (const category of categories) {
        const hotelCategory = await HotelCategory.create({
          hotelId: id,
          categoryName: category.categoryName,
          occupancy: category.occupancy,
          numberOfRooms: category.numberOfRooms,
        });

        // Create rooms for this category
        if (category.roomNumbers && category.roomNumbers.length > 0) {
          for (const roomNumber of category.roomNumbers) {
            await HotelRoom.create({
              hotelId: id,
              categoryId: hotelCategory._id,
              roomNumber,
            });
          }
        }
      }
    }

    // Fetch updated hotel with categories
    const updatedHotel = await Hotel.findById(id).populate({
      path: "categories",
      populate: {
        path: "rooms",
      },
    });

    res.json({
      success: true,
      message: "Hotel updated successfully",
      data: { ...updatedHotel.toObject(), id: updatedHotel._id },
    });
  } catch (error) {
    console.error("Error updating hotel:", error);
    res.status(500).json({
      success: false,
      message: "Error updating hotel",
      error: error.message,
    });
  }
};

// Delete hotel
const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    await Hotel.findByIdAndDelete(id);
    // Also delete categories, rooms, allotments
    await HotelCategory.deleteMany({ hotelId: id });
    await HotelRoom.deleteMany({ hotelId: id });
    await RoomAllotment.deleteMany({ hotelId: id });

    res.json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting hotel",
      error: error.message,
    });
  }
};

// Get room allotments
const getRoomAllotments = async (req, res) => {
  try {
    const { hotelId } = req.query;

    const query = {};
    if (hotelId) {
      query.hotelId = hotelId;
    }

    const allotments = await RoomAllotment.find(query)
      .populate("hotelId") // Populates 'hotelId' field with Hotel document
      .populate({
        path: "roomId",
        populate: {
          path: "categoryId",
          model: "HotelCategory",
        },
      })
      .sort({ createdAt: -1 });

    // Transform to match old structure
    const transformedAllotments = allotments.map((a) => {
      const obj = a.toObject();
      return {
        ...obj,
        id: obj._id,
        hotel: obj.hotelId, // Map populated hotelId to 'hotel'
        room: {
          ...obj.roomId, // Map populated roomId to 'room'
          category: obj.roomId ? obj.roomId.categoryId : null,
        },
      };
    });

    res.json({
      success: true,
      data: transformedAllotments,
    });
  } catch (error) {
    console.error("Error fetching room allotments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room allotments",
      error: error.message,
    });
  }
};

// Get available rooms for allotment
const getAvailableRooms = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // Get all rooms for the hotel
    const hotel = await Hotel.findById(hotelId).populate({
      path: "categories",
      populate: {
        path: "rooms",
      },
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // Get current allotments for this hotel
    const currentAllotments = await RoomAllotment.find({ hotelId }).populate(
      "roomId"
    );

    // Create a map of room occupancy
    const roomOccupancy = new Map();
    currentAllotments.forEach((allotment) => {
      // allotment.roomId is populated, so we need its _id
      const roomId = allotment.roomId ? allotment.roomId._id.toString() : null;
      if (roomId) {
        if (!roomOccupancy.has(roomId)) {
          roomOccupancy.set(roomId, 0);
        }
        roomOccupancy.set(roomId, roomOccupancy.get(roomId) + 1);
      }
    });

    // Filter available rooms based on capacity
    const availableRooms = [];

    if (hotel.categories) {
      hotel.categories.forEach((category) => {
        if (category.rooms) {
          category.rooms.forEach((room) => {
            const currentOccupancy =
              roomOccupancy.get(room._id.toString()) || 0;
            const maxOccupancy = category.occupancy || 1;

            if (currentOccupancy < maxOccupancy) {
              availableRooms.push({
                id: room._id,
                roomNumber: room.roomNumber,
                categoryName: category.categoryName,
                occupancy: category.occupancy,
                currentOccupancy: currentOccupancy,
                availableSlots: maxOccupancy - currentOccupancy,
                status:
                  currentOccupancy > 0 ? "partially_occupied" : "available",
              });
            }
          });
        }
      });
    }

    res.json({
      success: true,
      data: availableRooms,
    });
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available rooms",
      error: error.message,
    });
  }
};

// Create room allotment
const createRoomAllotment = async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      visitorId,
      visitorName,
      visitorNumber,
      checkInDate,
      checkOutDate,
      remarks,
    } = req.body;

    console.log("📝 Creating Room Allotment:", req.body);

    if (!hotelId || !roomId || !visitorId) {
      console.warn("❌ Missing required fields for room allotment");
      return res.status(400).json({
        success: false,
        message: "Hotel, Room and Visitor IDs are required",
      });
    }

    const allotment = await RoomAllotment.create({
      hotelId,
      roomId,
      visitorId,
      visitorName,
      visitorNumber,
      checkInDate,
      checkOutDate,
      remarks,
    });

    console.log("✅ Room Allotment Created:", allotment._id);

    // Update room status to occupied
    await HotelRoom.findByIdAndUpdate(roomId, { status: "occupied" });

    // Send SMS and WhatsApp notifications
    try {
      const hotel = await Hotel.findById(hotelId);
      const room = await HotelRoom.findById(roomId);
      const travelDetail = await TravelDetail.findOne({ visitorId });

      // --- SYNC WITH REPORTS ---
      // 1. Get Event ID from Visitor
      const visitor = await Visitor.findOne({ visitorId: visitorId });
      if (visitor && visitor.eventId && room.categoryId) {
        // Sync Logic
        await updateBookingCounts(
          visitor.eventId, // Stored as String or ObjectId? Visitor model says String, RoomBooking needs ObjectId.
          hotelId,
          room.categoryId,
          checkInDate,
          checkOutDate,
          1 // Add 1
        );
      }
      // -------------------------

      // Send SMS to visitor
      await sendRoomAllotmentSMS(
        visitorName,
        visitorNumber,
        hotel.hotelName,
        room.roomNumber,
        checkInDate
      );

      // Send WhatsApp notification to hotel
      if (hotel.contactNumber) {
        await sendHotelAllotmentNotification(hotel.contactNumber, travelDetail);
      }

      // Update allotment to mark notifications as sent
      await allotment.updateOne({ smsSent: true, whatsappSent: true });
    } catch (notificationError) {
      console.error("Notification sending failed:", notificationError);
      // Don't fail the entire operation if notifications fail
    }

    res.status(201).json({
      success: true,
      message: "Room allotted successfully and SMS notification sent",
      data: { ...allotment.toObject(), id: allotment._id },
    });
  } catch (error) {
    console.error("Error creating room allotment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating room allotment",
      error: error.message,
    });
  }
};

// Get hotel lists (arrival, departure, pickup, drop-off)
const getHotelLists = async (req, res) => {
  try {
    const { type, hotelId, date } = req.query;

    let query = {};
    if (hotelId) {
      query.hotelId = hotelId;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      if (type === "arrival") {
        query.checkInDate = {
          $gte: startDate,
          $lt: endDate,
        };
      } else if (type === "departure") {
        query.checkOutDate = {
          $gte: startDate,
          $lt: endDate,
        };
      }
    }

    const allotments = await RoomAllotment.find(query)
      .populate("hotelId")
      .populate({
        path: "roomId",
        populate: {
          path: "categoryId",
          model: "HotelCategory",
        },
      })
      .sort({ createdAt: -1 });

    const transformedAllotments = allotments.map((a) => {
      const obj = a.toObject();
      return {
        ...obj,
        id: obj._id,
        hotel: obj.hotelId,
        room: {
          ...obj.roomId,
          category: obj.roomId ? obj.roomId.categoryId : null,
        },
      };
    });

    res.json({
      success: true,
      data: transformedAllotments,
    });
  } catch (error) {
    console.error("Error fetching hotel lists:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hotel lists",
      error: error.message,
    });
  }
};

// Update room allotment status (check-in/check-out)
const updateRoomAllotmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'checked-in', 'checked-out', 'cancelled'

    if (!["checked-in", "checked-out", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be checked-in, checked-out, or cancelled",
      });
    }

    const allotment = await RoomAllotment.findById(id);
    if (!allotment) {
      return res.status(404).json({
        success: false,
        message: "Allotment not found",
      });
    }

    // Update allotment status
    await allotment.updateOne({ status });

    // Update room status based on allotment status
    if (status === "checked-out" || status === "cancelled") {
      // Mark room as available
      await HotelRoom.findByIdAndUpdate(allotment.roomId, {
        status: "available",
      });
    } else if (status === "checked-in") {
      // Ensure room is marked as occupied
      await HotelRoom.findByIdAndUpdate(allotment.roomId, {
        status: "occupied",
      });
    }

    res.json({
      success: true,
      message: `Room allotment status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating allotment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating allotment status",
      error: error.message,
    });
  }
};

// Update room allotment details
const updateRoomAllotment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`📝 Updating Room Allotment ${id} with:`, updateData);

    const allotment = await RoomAllotment.findById(id);

    if (!allotment) {
      return res.status(404).json({
        success: false,
        message: "Room allotment not found",
      });
    }

    await allotment.updateOne(updateData);

    // Fetch updated allotment
    const updatedAllotment = await RoomAllotment.findById(id)
      .populate("hotelId")
      .populate({
        path: "roomId",
        populate: {
          path: "categoryId",
          model: "HotelCategory",
        },
      });

    res.json({
      success: true,
      message: "Room allotment updated successfully",
      data: {
        ...updatedAllotment.toObject(),
        id: updatedAllotment._id,
        hotel: updatedAllotment.hotelId,
        room: updatedAllotment.roomId,
      },
    });
  } catch (error) {
    console.error("Error updating room allotment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating room allotment",
      error: error.message,
    });
  }
};

module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getRoomAllotments,
  getAvailableRooms,
  createRoomAllotment,
  getHotelLists,
  updateRoomAllotmentStatus,
  updateRoomAllotment,
};
