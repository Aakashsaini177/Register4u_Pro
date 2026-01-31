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
const Event = require("../models/Event");

// Helper: Update Booking Counts (Sync Allotment -> Report)
const updateBookingCounts = async (
  eventId,
  hotelId,
  categoryId,
  checkIn,
  checkOut,
  occupancy = 1,
  change = 1,
) => {
  try {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const dateArray = [];

    // Loop dates: CheckIn (inclusive) -> CheckOut (exclusive)
    let currentDate = new Date(startDate);
    while (currentDate < endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (dateArray.length === 0) return;

    for (const date of dateArray) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      await RoomBooking.updateOne(
        {
          eventId: eventId,
          hotelId: hotelId,
          categoryId: categoryId,
          date: d,
          occupancy: occupancy,
        },
        { $inc: { roomsBooked: change } },
        { upsert: true },
      );
    }
  } catch (err) {
    console.error("❌ Failed to sync Booking Report:", err.message, err.stack);
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

// Helper to generate Hotel ID
const generateHotelId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000 to 9999
  return `HTL${randomNum}`;
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
    let hotelId = generateHotelId();
    let exists = await Hotel.findOne({ hotelId });
    while (exists) {
      hotelId = generateHotelId();
      exists = await Hotel.findOne({ hotelId });
    }

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
        // Validate room numbers are unique within this category
        if (category.roomNumbers && category.roomNumbers.length > 0) {
          const uniqueRoomNumbers = new Set(category.roomNumbers);
          if (uniqueRoomNumbers.size !== category.roomNumbers.length) {
            return res.status(400).json({
              success: false,
              message: `Duplicate room numbers found in category "${category.categoryName}". Each room number must be unique within the same category.`,
            });
          }
        }

        const hotelCategory = await HotelCategory.create({
          hotelId: hotel._id,
          categoryName: category.categoryName,
          occupancy: category.occupancy,
          numberOfRooms: category.numberOfRooms,
        });

        // Create rooms for this category
        if (category.roomNumbers && category.roomNumbers.length > 0) {
          for (const roomNumber of category.roomNumbers) {
            try {
              await HotelRoom.create({
                hotelId: hotel._id,
                categoryId: hotelCategory._id,
                roomNumber,
              });
            } catch (roomError) {
              // Handle duplicate room number error
              if (roomError.code === 11000) {
                // Cleanup: Delete hotel and categories created so far
                await Hotel.findByIdAndDelete(hotel._id);
                await HotelCategory.deleteMany({ hotelId: hotel._id });
                await HotelRoom.deleteMany({ hotelId: hotel._id });

                return res.status(400).json({
                  success: false,
                  message: `Room number "${roomNumber}" already exists in category "${category.categoryName}". Please use unique room numbers.`,
                });
              }
              throw roomError;
            }
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
      // Validate room numbers are unique within each category
      for (const category of categories) {
        if (category.roomNumbers && category.roomNumbers.length > 0) {
          const uniqueRoomNumbers = new Set(category.roomNumbers);
          if (uniqueRoomNumbers.size !== category.roomNumbers.length) {
            return res.status(400).json({
              success: false,
              message: `Duplicate room numbers found in category "${category.categoryName}". Each room number must be unique within the same category.`,
            });
          }
        }
      }

      // Delete existing categories and rooms
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
            try {
              await HotelRoom.create({
                hotelId: id,
                categoryId: hotelCategory._id,
                roomNumber,
              });
            } catch (roomError) {
              // Handle duplicate room number error
              if (roomError.code === 11000) {
                return res.status(400).json({
                  success: false,
                  message: `Room number "${roomNumber}" already exists in category "${category.categoryName}". Please use unique room numbers.`,
                });
              }
              throw roomError;
            }
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

// Get hotel allotments by visitor ID
const getHotelAllotmentsByVisitorId = async (req, res) => {
  try {
    const { visitorId } = req.params;

    const allotments = await RoomAllotment.find({ visitorId })
      .populate("hotelId")
      .populate({
        path: "roomId",
        populate: {
          path: "categoryId",
          model: "HotelCategory",
        },
      })
      .sort({ createdAt: -1 });

    // Transform to match structure
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
    console.error("Error fetching hotel allotments by visitor ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hotel allotments",
      error: error.message,
    });
  }
};

// Get available rooms for allotment (Date-Aware)
const getAvailableRooms = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkInDate, checkOutDate } = req.query;

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

    let occupiedRoomIds = new Set();
    const roomOccupancy = new Map();

    // If dates are provided, check for overlaps
    if (checkInDate && checkOutDate) {
      const requestedCheckIn = new Date(checkInDate);
      const requestedCheckOut = new Date(checkOutDate);

      // Find overlapping allotments
      // Overlap Logic: (StartA < EndB) and (EndA > StartB)
      // OPTIMIZATION: Do not populate roomId here. We just need the ID.
      const conflictingAllotments = await RoomAllotment.find({
        hotelId,
        status: { $in: ["booked", "checked-in"] }, // only active bookings block rooms
        $or: [
          {
            checkInDate: { $lt: requestedCheckOut },
            checkOutDate: { $gt: requestedCheckIn },
          },
        ],
      });

      conflictingAllotments.forEach((allotment) => {
        if (allotment.roomId) {
          const rId = allotment.roomId.toString();
          occupiedRoomIds.add(rId);
          // Track Total Pax Occupancy (Sum of occupancy field)
          const pax = parseInt(allotment.occupancy) || 1;
          roomOccupancy.set(rId, (roomOccupancy.get(rId) || 0) + pax);
        }
      });
    } else {
      // Fallback: Currently Active
      const now = new Date();
      const currentAllotments = await RoomAllotment.find({
        hotelId,
        status: { $in: ["booked", "checked-in"] },
        checkInDate: { $lte: now },
        checkOutDate: { $gte: now },
      });
      currentAllotments.forEach((allotment) => {
        if (allotment.roomId) {
          const rId = allotment.roomId.toString();
          occupiedRoomIds.add(rId);
          const pax = parseInt(allotment.occupancy) || 1;
          roomOccupancy.set(rId, (roomOccupancy.get(rId) || 0) + pax);
        }
      });
    }

    // Filter available rooms based on capacity/occupancy
    const availableRooms = [];

    if (hotel.categories) {
      hotel.categories.forEach((category) => {
        if (category.rooms) {
          category.rooms.forEach((room) => {
            const rId = room._id.toString();
            const currentOccupancy = roomOccupancy.get(rId) || 0;
            const maxOccupancy = category.occupancy || 1;

            // Logic: If usage < capacity, it's available.
            // Using Total Pax Occupancy vs Max Capacity
            if (currentOccupancy < maxOccupancy) {
              availableRooms.push({
                id: room._id,
                roomNumber: room.roomNumber,
                categoryName: category.categoryName,
                occupancy: category.occupancy,
                currentOccupancy: currentOccupancy,
                availableSlots: maxOccupancy - currentOccupancy,
                status: currentOccupancy > 0 ? "partial" : "available", // Helper status
              });
            } else {
              // Room is Full - DO NOT ADD to availableRooms
              // This ensures it doesn't show up in the "Available" list (or logic in UI handles it)
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
      occupancy,
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

    // Validate Capacity Check again before blocking
    // Fetch room category capacity
    const room = await HotelRoom.findById(roomId).populate("categoryId");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const maxCapacity = room.categoryId?.occupancy || 1;
    const requestedOccupancy = parseInt(occupancy) || 1;

    // Check overlaps for this room to calculate current load
    const start = new Date(checkInDate);
    const end = checkOutDate
      ? new Date(checkOutDate)
      : new Date(new Date(checkInDate).getTime() + 24 * 60 * 60 * 1000);

    const conflicting = await RoomAllotment.find({
      roomId: roomId,
      status: { $in: ["booked", "checked-in"] },
      $or: [
        {
          checkInDate: { $lt: end },
          checkOutDate: { $gt: start },
        },
      ],
    });

    const currentLoad = conflicting.reduce(
      (sum, a) => sum + (parseInt(a.occupancy) || 1),
      0,
    );

    if (currentLoad + requestedOccupancy > maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `Room capacity exceeded! Current: ${currentLoad}/${maxCapacity}, Requested: ${requestedOccupancy}`,
      });
    }

    // Create Allotment
    const allotment = await RoomAllotment.create({
      hotelId,
      roomId,
      visitorId,
      visitorName,
      visitorNumber,
      occupancy: requestedOccupancy,
      checkInDate,
      checkOutDate: end,
      remarks,
    });

    console.log("✅ Room Allotment Created:", allotment._id);

    // Update room status to occupied ONLY if full
    // Re-calculate load including new allotment
    const newLoad = currentLoad + requestedOccupancy;
    if (newLoad >= maxCapacity) {
      console.log(
        `🔒 Room ${roomId} Full (${newLoad}/${maxCapacity}). Marking as occupied.`,
      );
      await HotelRoom.findByIdAndUpdate(roomId, { status: "occupied" });
    } else {
      console.log(
        `🔓 Room ${roomId} Partial (${newLoad}/${maxCapacity}). Marking as available.`,
      );
      // Ensure it is marked available so it shows up in "Available" list for next person
      await HotelRoom.findByIdAndUpdate(roomId, { status: "available" });
    }

    // Send SMS and WhatsApp notifications
    try {
      const hotel = await Hotel.findById(hotelId);
      const travelDetail = await TravelDetail.findOne({ visitorId });

      // --- SYNC WITH REPORTS ---
      // 1. Get Event ID from Visitor
      const visitor = await Visitor.findOne({ visitorId: visitorId });

      if (visitor && visitor.eventId && room.categoryId) {
        try {
          let realEventId = visitor.eventId;

          // Check if visitor.eventId is a valid ObjectId, if not, lookup by custom eventId
          const mongoose = require("mongoose");
          if (!mongoose.Types.ObjectId.isValid(visitor.eventId)) {
            console.log(`🔍 Resolving Custom Event ID: ${visitor.eventId}`);
            const eventDoc = await Event.findOne({ eventId: visitor.eventId });
            if (eventDoc) {
              realEventId = eventDoc._id;
              console.log("✅ Resolved to Event ObjectID:", realEventId);
            } else {
              console.warn(
                "❌ Could not resolve custom eventId:",
                visitor.eventId,
              );
              realEventId = null;
            }
          }

          if (realEventId) {
            console.log("🚀 Triggering updateBookingCounts with:", realEventId);
            // Sync Logic with occupancy
            await updateBookingCounts(
              realEventId,
              hotelId,
              room.categoryId._id, // Use ID from populated doc
              checkInDate,
              checkOutDate || end,
              requestedOccupancy,
              1, // Add 1
            );
          }
        } catch (syncErr) {
          console.error("❌ Sync Logic Error:", syncErr);
        }
      } else {
        console.warn("⚠️ Skipping Sync - Missing Data:", {
          hasVisitor: !!visitor,
          hasEventId: visitor?.eventId,
          hasCategoryId: room?.categoryId,
        });
      }
      // -------------------------

      // Send SMS to visitor
      await sendRoomAllotmentSMS(
        visitorName,
        visitorNumber,
        hotel.hotelName,
        room.roomNumber,
        checkInDate,
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

    // Check if room is being changed
    if (
      updateData.roomId &&
      updateData.roomId !== allotment.roomId.toString()
    ) {
      console.log(
        `🔄 Swapping Room: ${allotment.roomId} -> ${updateData.roomId}`,
      );

      // 1. Release the old room
      await HotelRoom.findByIdAndUpdate(allotment.roomId, {
        status: "available",
      });

      // 2. Occupy the new room
      await HotelRoom.findByIdAndUpdate(updateData.roomId, {
        status: "occupied",
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

// Get Single Allotment by ID
const getRoomAllotmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const allotment = await RoomAllotment.findById(id)
      .populate("hotelId")
      .populate({
        path: "roomId",
        populate: {
          path: "categoryId",
          model: "HotelCategory",
        },
      });

    if (!allotment) {
      return res.status(404).json({
        success: false,
        message: "Room allotment not found",
      });
    }

    res.json({
      success: true,
      data: allotment,
    });
  } catch (error) {
    console.error("Error fetching room allotment:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room allotment",
      error: error.message,
    });
  }
};

// Get Inventory Status (Total, Occupied, Available) for all hotels
const getInventoryStatus = async (req, res) => {
  try {
    const { date } = req.query;
    const checkDate = date ? new Date(date) : new Date();

    // Normalize date to start of day for broad overlap
    const startOfDay = new Date(checkDate);
    startOfDay.setHours(0, 0, 0, 0);
    // End of Day
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(
      `📊 Fetching Inventory Status for: ${startOfDay.toISOString()}`,
    );

    // 1. Get all hotels with their rooms
    // We need 'rooms' populated to check individual room IDs
    const hotels = await Hotel.find({})
      .populate({
        path: "categories",
        populate: {
          path: "rooms",
        },
      })
      .lean();

    // 2. Get all active allotments that overlap with this day
    // OPTIMIZATION: Do not populate roomId, use ID directly
    const allotments = await RoomAllotment.find({
      status: { $in: ["booked", "checked-in"] },
      $or: [
        // Standard Overlap: (Start < EndQuery) AND (End > StartQuery)
        {
          checkInDate: { $lt: endOfDay },
          checkOutDate: { $gt: startOfDay },
        },
        // Handle cases where checkOutDate might be missing (treat as indefinite/active)
        {
          checkInDate: { $lt: endOfDay },
          checkOutDate: null,
        },
        // Handle cases where checkOutDate is not set (undefined)
        {
          checkInDate: { $lt: endOfDay },
          checkOutDate: { $exists: false },
        },
      ],
    }).lean();

    // 3. Map allotments to ROOM IDs to calculate occupancy load
    const roomOccupancyMap = {}; // roomId -> totalPax
    allotments.forEach((allot) => {
      if (allot.roomId) {
        const rId = allot.roomId.toString();
        const pax = parseInt(allot.occupancy) || 1;
        roomOccupancyMap[rId] = (roomOccupancyMap[rId] || 0) + pax;
      }
    });

    // 4. Construct result
    const result = hotels.map((hotel) => {
      let totalRooms = 0;
      let availableCount = 0;

      hotel.categories?.forEach((cat) => {
        // Use actual rooms list if available to check specific status
        if (cat.rooms && cat.rooms.length > 0) {
          cat.rooms.forEach((room) => {
            totalRooms++;
            const rId = room._id.toString();
            const currentLoad = roomOccupancyMap[rId] || 0;
            const capacity = cat.occupancy || 1;

            if (currentLoad < capacity) {
              availableCount++;
            }
          });
        } else {
          // Fallback if rooms not created yet but count exists (should rarely happen in active hotels)
          totalRooms += cat.numberOfRooms || 0;
          // In fallback, we can't check partials easily without room IDs.
          // Assume available if we don't know? Or omit?
          // Let's assume they are available if we have no allotments mapped (which we won't have if no IDs)
          availableCount += cat.numberOfRooms || 0;
        }
      });

      const fullRooms = Math.max(0, totalRooms - availableCount);

      return {
        hotelId: hotel._id,
        customHotelId: hotel.hotelId,
        hotelName: hotel.hotelName,
        totalRooms,
        occupiedRooms: fullRooms, // Represents "Full/Unavailable" rooms
        availableRooms: availableCount, // Includes Empty + Partial
      };
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting inventory status:", error);
    res.status(500).json({
      success: false,
      message: "Error getting inventory status",
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
  getHotelAllotmentsByVisitorId,
  getAvailableRooms,
  createRoomAllotment,
  getHotelLists,
  updateRoomAllotmentStatus,
  updateRoomAllotment,
  getRoomAllotmentById,
  getInventoryStatus,
};
