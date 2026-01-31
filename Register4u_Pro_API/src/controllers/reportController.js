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
      // Logic: 'Used' means Room is FULL (based on capacity)
      // 1. Fetch active Allotments
      const allotments = await RoomAllotment.find({
        status: { $in: ["booked", "checked-in"] },
        hotelId: { $in: hotelIds },
      }).select("roomId hotelId occupancy");

      // 2. Fetch Hotels with Rooms & Categories (Capacity)
      const hotelsWithRooms = await Hotel.find({
        _id: { $in: hotelIds },
      })
        .populate({
          path: "categories",
          populate: { path: "rooms" },
        })
        .lean();

      // 3. Calculate Room Occupancy Sum
      const roomOccupancyMap = {};
      allotments.forEach((a) => {
        if (a.roomId) {
          const rId = a.roomId.toString();
          const pax = parseInt(a.occupancy) || 1;
          roomOccupancyMap[rId] = (roomOccupancyMap[rId] || 0) + pax;
        }
      });

      // 4. Calculate Full Rooms per Hotel-Category
      // We need an array structure like the aggregation result: { _id: { hotelId, categoryId }, used: amount }
      const categoryStats = [];

      hotelsWithRooms.forEach((hotel) => {
        hotel.categories?.forEach((cat) => {
          let fullCount = 0;
          if (cat.rooms) {
            cat.rooms.forEach((room) => {
              const rId = room._id.toString();
              const currentLoad = roomOccupancyMap[rId] || 0;
              const max = cat.occupancy || 1;
              if (currentLoad >= max) {
                fullCount++;
              }
            });
          }

          if (fullCount > 0) {
            categoryStats.push({
              _id: { hotelId: hotel._id, categoryId: cat._id },
              categoryName: cat.categoryName, // Pass name directly
              used: fullCount,
            });
          }
        });
      });

      bookings = categoryStats;
    } else {
      // Event Specific Logic - Use RoomBooking with HotelCategory
      const rawBookings = await RoomBooking.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        {
          $group: {
            _id: { hotelId: "$hotelId", categoryId: "$categoryId" },
            used: { $sum: "$roomsBooked" },
          },
        },
      ]);

      // Populate HotelCategory Names
      bookings = await HotelCategory.populate(rawBookings, {
        path: "_id.categoryId",
        select: "categoryName",
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
      // booking._id.categoryId is the populated HotelCategory object
      // booking._id.categoryId is the populated HotelCategory object
      const catName = booking.categoryName
        ? booking.categoryName.trim()
        : booking._id.categoryId && booking._id.categoryId.categoryName
          ? booking._id.categoryId.categoryName.trim()
          : null;

      if (hotelMap[hId] && catName) {
        // Match by category name
        if (hotelMap[hId].categories[catName]) {
          hotelMap[hId].categories[catName].used += booking.used;
          hotelMap[hId].usedRooms += booking.used;
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

    if (isGeneral) {
      // General Summary: Aggregate from RoomAllotment
      paxStats = await RoomAllotment.aggregate([
        {
          $match: {
            status: { $in: ["booked", "checked-in"] },
          },
        },
        {
          $group: {
            _id: { hotelId: "$hotelId", occupancy: "$occupancy" },
            used: { $sum: 1 },
          },
        },
      ]);
    } else {
      // Event Specific: Use RoomBooking
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

    let bookingSum = []; // Will store { _id: hotelId, used: count }
    if (isGeneral) {
      // Master Summary: Calculate Full Rooms based on Capacity

      // 1. Fetch all active allotments for these hotels
      const allotments = await RoomAllotment.find({
        status: { $in: ["booked", "checked-in"] },
        hotelId: { $in: hotelIds },
      }).select("roomId hotelId occupancy");

      // 2. Fetch all rooms with category capacity
      // We need to know capacity of each room to determine if it is Full
      const hotelsWithRooms = await Hotel.find({
        _id: { $in: hotelIds },
      })
        .populate({
          path: "categories",
          populate: { path: "rooms" }, // Need individual rooms to map IDs
        })
        .lean();

      // 3. Calculate Occupancy Per Room
      const roomOccupancyMap = {}; // roomId -> totalPax
      allotments.forEach((a) => {
        if (a.roomId) {
          const rId = a.roomId.toString(); // assuming just ID string or OID
          const pax = parseInt(a.occupancy) || 1;
          roomOccupancyMap[rId] = (roomOccupancyMap[rId] || 0) + pax;
        }
      });

      // 4. Count Full Rooms per Hotel
      const hotelFullCount = {}; // hotelId -> count

      hotelsWithRooms.forEach((hotel) => {
        const hId = hotel._id.toString();
        let fullCount = 0;

        hotel.categories?.forEach((cat) => {
          if (cat.rooms) {
            cat.rooms.forEach((room) => {
              const rId = room._id.toString();
              const currentLoad = roomOccupancyMap[rId] || 0;
              const max = cat.occupancy || 1;
              if (currentLoad >= max) {
                fullCount++;
              }
            });
          }
        });
        hotelFullCount[hId] = fullCount;
      });

      // Transform to match structure expected by map below
      bookingSum = Object.keys(hotelFullCount).map((hId) => ({
        _id: hId, // String ID
        used: hotelFullCount[hId],
      }));
    } else {
      bookingSum = await RoomBooking.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        { $group: { _id: "$hotelId", used: { $sum: "$roomsBooked" } } },
      ]);
    }

    const reportData = targetHotels.map((hotel) => {
      const inv = inventorySum.find(
        (i) => i._id.toString() === hotel._id.toString(),
      );
      // Helper check for string vs ObjectId match
      const bk = bookingSum.find(
        (b) => b._id.toString() === hotel._id.toString(),
      );
      const total = inv ? inv.total : 0;
      const used = bk ? bk.used : 0;

      return {
        hotelName: hotel.hotelName,
        totalRooms: total,
        usedRooms: used, // Now represents FULL rooms
        inHand: total - used, // Available (Empty + Partial)
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
    const isGeneral = eventId === "general";
    let bookings = [];

    if (isGeneral) {
      // General Summary: Aggregate from RoomAllotment
      const allotments = await RoomAllotment.aggregate([
        {
          $match: {
            status: { $in: ["booked", "checked-in"] },
            checkInDate: { $exists: true },
            checkOutDate: { $exists: true },
          },
        },
        // Lookup Room to get Category
        {
          $lookup: {
            from: "hotelrooms",
            localField: "roomId",
            foreignField: "_id",
            as: "room",
          },
        },
        { $unwind: "$room" },
        // Lookup HotelCategory
        {
          $lookup: {
            from: "hotelcategories",
            localField: "room.categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        // Generate date range for each allotment
        {
          $project: {
            categoryId: "$room.categoryId",
            categoryName: "$category.categoryName",
            checkInDate: 1,
            checkOutDate: 1,
          },
        },
      ]);

      // Expand date ranges
      const dateMap = {};
      for (const allot of allotments) {
        const start = new Date(allot.checkInDate);
        const end = new Date(allot.checkOutDate);
        let current = new Date(start);

        while (current < end) {
          const dateStr = current.toISOString().split("T")[0];
          const key = `${dateStr}_${allot.categoryId}`;

          if (!dateMap[key]) {
            dateMap[key] = {
              date: dateStr,
              categoryId: allot.categoryId,
              categoryName: allot.categoryName,
              used: 0,
            };
          }
          dateMap[key].used += 1;
          current.setDate(current.getDate() + 1);
        }
      }

      bookings = Object.values(dateMap).map((item) => ({
        _id: { date: item.date, categoryId: item.categoryId },
        categoryName: item.categoryName,
        used: item.used,
      }));
    } else {
      // Event Specific: Use RoomBooking
      bookings = await RoomBooking.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        {
          $lookup: {
            from: "hotelcategories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              categoryId: "$categoryId",
            },
            categoryName: { $first: "$category.categoryName" },
            used: { $sum: "$roomsBooked" },
          },
        },
      ]);
    }

    // Get unique categories
    const categoryMap = {};
    const allDates = new Set();

    for (const b of bookings) {
      const catId = b._id.categoryId.toString();
      const catName = b.categoryName || "Unknown";

      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          categoryId: catId,
          categoryName: catName,
          dates: {},
          totalUsed: 0,
        };
      }

      categoryMap[catId].dates[b._id.date] = b.used;
      categoryMap[catId].totalUsed += b.used;
      allDates.add(b._id.date);
    }

    const reportData = Object.values(categoryMap);
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
