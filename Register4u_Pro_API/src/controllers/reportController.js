const mongoose = require("mongoose");
const {
  Hotel,
  RoomCategory,
  HotelRoomInventory,
  RoomBooking,
  EventHotel,
  HotelCategory,
  RoomAllotment,
} = require("../models");

// 1️⃣ Room Category Wise Summary
exports.getRoomCategorySummary = async (req, res) => {
  try {
    const { eventId } = req.params;

    // 1. Get List of Hotels
    let hotelIds = [];
    const isGeneral = eventId === "general";
    let targetHotels = [];

    if (isGeneral) {
      // Master Summary: Fetch active hotels
      targetHotels = await Hotel.find({ status: "active" });
    } else {
      // Event Specific: Fetch mapped hotels
      const eventHotels = await EventHotel.find({ eventId }).select("hotelId");
      const mappedParamIds = eventHotels.map((eh) => eh.hotelId);
      targetHotels = await Hotel.find({ _id: { $in: mappedParamIds } });
    }

    hotelIds = targetHotels.map((h) => h._id);

    // 2. Fetch Inventory from HotelCategory (Source of Truth for "Add Hotel")
    const hotelCategories = await HotelCategory.find({
      hotelId: { $in: hotelIds },
    });

    // 3. Determine Columns (Unique Category Names)
    // Normalize names to Title Case or just string match
    const uniqueCategoryNames = [
      ...new Set(hotelCategories.map((hc) => hc.categoryName.trim())),
    ].sort();

    // Create Column Objects for Frontend
    const columns = uniqueCategoryNames.map((name) => ({
      _id: name, // Use Name as ID for mapping
      name: name,
    }));

    // 4. Fetch Bookings
    // For General: Use RoomAllotment directly (Real-time, ignores Event)
    // For Event: Use RoomBooking (Sync-based, Event-filtered)
    let bookings = [];

    if (isGeneral) {
      // Aggregate from Allotments
      const allotments = await RoomAllotment.aggregate([
        {
          $match: {
            status: { $in: ["booked", "checked-in", "checked-out"] }, // Count all valid allotments
            // Note: checked-out rooms are technically 'used' in the past?
            // Usually 'Used' implies 'Occupied' or 'Reserved for future'.
            // If report is "Current Status", checked-out should be free?
            // User asked for "Used Rooms" count. Usually 'booked' + 'checked-in'.
          },
        },
        // We need category ID. Allotment has roomId via Link, or we can assume linked.
        // Let's Lookup Room to get Category
        {
          $lookup: {
            from: "hotelrooms", // collection name
            localField: "roomId",
            foreignField: "_id",
            as: "room",
          },
        },
        { $unwind: "$room" },
        {
          $group: {
            _id: { hotelId: "$hotelId", categoryId: "$room.categoryId" },
            used: { $sum: 1 }, // One allotment = 1 room used
          },
        },
      ]);

      // Populate Category Names
      bookings = await RoomCategory.populate(allotments, {
        path: "_id.categoryId",
        select: "name",
      });
    } else {
      // Event Specific Logic (Existing)
      const rawBookings = await RoomBooking.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        {
          $group: {
            _id: { hotelId: "$hotelId", categoryId: "$categoryId" },
            used: { $sum: "$roomsBooked" },
          },
        },
      ]);

      // Populate Category Names for mapping
      bookings = await RoomCategory.populate(rawBookings, {
        path: "_id.categoryId",
        select: "name",
      });
    }

    // 5. Build Report Data
    const reportData = [];
    const hotelMap = {};

    // Initialize Rows
    for (const hotel of targetHotels) {
      const hId = hotel._id.toString();
      hotelMap[hId] = {
        hotelId: hId,
        hotelName: hotel.hotelName,
        categories: {},
        totalRooms: 0,
        usedRooms: 0,
      };
      // Initialize all columns with 0
      uniqueCategoryNames.forEach((name) => {
        hotelMap[hId].categories[name] = { total: 0, used: 0 };
      });
      reportData.push(hotelMap[hId]);
    }

    // Fill Inventory (Total Rooms)
    for (const hc of hotelCategories) {
      const hId = hc.hotelId.toString();
      const catName = hc.categoryName.trim();

      if (hotelMap[hId]) {
        if (hotelMap[hId].categories[catName]) {
          hotelMap[hId].categories[catName].total += hc.numberOfRooms || 0;
          hotelMap[hId].totalRooms += hc.numberOfRooms || 0;
        }
      }
    }

    // Fill Used Rooms (Bookings)
    for (const booking of bookings) {
      const hId = booking._id.hotelId.toString();
      // booking._id.categoryId is the populated object now
      const catName = booking._id.categoryId
        ? booking._id.categoryId.name.trim()
        : null;

      if (hotelMap[hId] && catName) {
        // Find matching column by name (loose match)
        // Ensure the column exists (it might be a Master Category not in HotelCategory?)
        // If it exists in our columns list:
        if (hotelMap[hId].categories[catName]) {
          hotelMap[hId].categories[catName].used += booking.used;
          hotelMap[hId].usedRooms += booking.used;
        } else {
          // New column needed? For now, ignore or log mismatch
          // const newKey = `${catName} (Ext)`;
          // hotelMap[hId].categories[newKey] = { total: 0, used: booking.used };
          // hotelMap[hId].usedRooms += booking.used;
        }
      }
    }

    res.json({
      success: true,
      columns: columns,
      data: reportData,
    });
  } catch (error) {
    console.error("Category Summary Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2️⃣ Pax Wise Summary
exports.getPaxSummary = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Fetch bookings grouped by Hotel + Occupancy
    let paxStats = [];
    const isGeneral = eventId === "general";

    if (!isGeneral) {
      paxStats = await RoomBooking.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        {
          $group: {
            _id: { hotelId: "$hotelId", occupancy: "$occupancy" },
            used: { $sum: "$roomsBooked" },
          },
        },
      ]);
    }

    let eventHotels = [];
    if (isGeneral) {
      const allHotels = await Hotel.find({ status: "active" });
      eventHotels = allHotels.map((h) => ({ hotelId: h }));
    } else {
      eventHotels = await EventHotel.find({ eventId }).populate("hotelId");
    }
    const reportData = eventHotels.map((eh) => ({
      hotelId: eh.hotelId._id,
      hotelName: eh.hotelId.hotelName,
      paxBreakdown: {}, // { "2": 10, "3": 5 }
      totalUsed: 0,
    }));

    for (const stat of paxStats) {
      const hId = stat._id.hotelId.toString();
      const row = reportData.find((r) => r.hotelId.toString() === hId);
      if (row) {
        row.paxBreakdown[stat._id.occupancy] = stat.used;
        row.totalUsed += stat.used;
      }
    }

    res.json({ success: true, data: reportData });
  } catch (error) {
    console.error("Pax Summary Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3️⃣ Hotel Wise Summary
exports.getHotelWiseSummary = async (req, res) => {
  try {
    const { eventId } = req.params;
    const isGeneral = eventId === "general";

    let targetHotels = [];
    if (isGeneral) {
      targetHotels = await Hotel.find({ status: "active" });
    } else {
      const eventHotels = await EventHotel.find({ eventId }).select("hotelId");
      const hotelIds = eventHotels.map((eh) => eh.hotelId);
      targetHotels = await Hotel.find({ _id: { $in: hotelIds } });
    }

    const hotelIds = targetHotels.map((h) => h._id);

    // Aggregate Total from HotelCategory
    const inventorySum = await HotelCategory.aggregate([
      { $match: { hotelId: { $in: hotelIds } } },
      { $group: { _id: "$hotelId", total: { $sum: "$numberOfRooms" } } },
    ]);

    let bookingSum = [];
    if (isGeneral) {
      // Master Summary: Aggregate from RoomAllotment
      bookingSum = await RoomAllotment.aggregate([
        {
          $match: {
            status: { $in: ["booked", "checked-in"] },
            hotelId: { $in: hotelIds },
          },
        },
        { $group: { _id: "$hotelId", used: { $sum: 1 } } },
      ]);
    } else {
      bookingSum = await RoomBooking.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        { $group: { _id: "$hotelId", used: { $sum: "$roomsBooked" } } },
      ]);
    }

    const reportData = targetHotels.map((hotel) => {
      const inv = inventorySum.find(
        (i) => i._id.toString() === hotel._id.toString()
      );
      const bk = bookingSum.find(
        (b) => b._id.toString() === hotel._id.toString()
      );
      const total = inv ? inv.total : 0;
      const used = bk ? bk.used : 0;

      return {
        hotelName: hotel.hotelName,
        totalRooms: total,
        usedRooms: used,
        inHand: total - used,
      };
    });

    res.json({ success: true, data: reportData });
  } catch (error) {
    console.error("Hotel Summary Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4️⃣ Date Wise Summary
exports.getDateWiseSummary = async (req, res) => {
  try {
    const { eventId } = req.params;
    // Group by Date + Category (across all hotels or specific?)
    // Requirement: Category | 21-Mar | 22-Mar | Total

    const isGeneral = eventId === "general";
    let bookings = [];

    if (!isGeneral) {
      bookings = await RoomBooking.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              categoryId: "$categoryId",
            },
            used: { $sum: "$roomsBooked" },
          },
        },
      ]);
    }

    const categories = await RoomCategory.find().lean();
    const reportData = categories.map((cat) => ({
      categoryId: cat._id,
      categoryName: cat.name,
      dates: {},
      totalUsed: 0,
    }));

    const allDates = new Set();

    for (const b of bookings) {
      const row = reportData.find(
        (r) => r.categoryId.toString() === b._id.categoryId.toString()
      );
      if (row) {
        row.dates[b._id.date] = b.used;
        row.totalUsed += b.used;
        allDates.add(b._id.date);
      }
    }

    // Sort dates
    const sortedDates = Array.from(allDates).sort();

    res.json({ success: true, dates: sortedDates, data: reportData });
  } catch (error) {
    console.error("Date Summary Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5️⃣ Hotel Contact Summary
exports.getHotelContactSummary = async (req, res) => {
  try {
    const { eventId } = req.params;
    let eventHotels = [];

    if (eventId === "general") {
      // Return ALL active hotels wrapped to match structure
      const allHotels = await Hotel.find({ status: "active" });
      eventHotels = allHotels.map((h) => ({ hotelId: h }));
    } else {
      eventHotels = await EventHotel.find({ eventId }).populate("hotelId");
    }

    const reportData = eventHotels.map((eh) => ({
      hotelName: eh.hotelId.hotelName,
      contactPerson: eh.hotelId.contactPerson || "N/A",
      contactMobile: eh.hotelId.contactNumber || "N/A",
      // Assuming we add these fields later or they exist in 'contactPerson' logic
      managedBy: "N/A",
      managedByMobile: "N/A",
    }));

    res.json({ success: true, data: reportData });
  } catch (error) {
    console.error("Contact Summary Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
