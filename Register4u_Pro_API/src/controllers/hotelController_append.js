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
      `📊 Fetching Inventory Status for: ${startOfDay.toISOString()}`
    );

    // 1. Get all hotels with their rooms
    const hotels = await Hotel.find({}).populate("categories").lean();

    // 2. Get all active allotments that overlap with this day
    const allotments = await RoomAllotment.find({
      status: { $in: ["booked", "checked-in"] },
      $or: [
        // Overlap logic: (Start < EndQuery) AND (End > StartQuery)
        {
          checkInDate: { $lt: endOfDay },
          checkOutDate: { $gt: startOfDay },
        },
      ],
    }).lean();

    // 3. Map allotments to hotel IDs
    const allotmentMap = {}; // hotelId -> count
    allotments.forEach((allot) => {
      const hId = allot.hotelId.toString();
      allotmentMap[hId] = (allotmentMap[hId] || 0) + 1;
    });

    // 4. Construct result
    const result = hotels.map((hotel) => {
      let totalRooms = 0;
      hotel.categories?.forEach((cat) => {
        totalRooms += cat.numberOfRooms || (cat.rooms ? cat.rooms.length : 0);
        // Fallback if rooms array is not populated fully or just use schema count
      });

      const occupied = allotmentMap[hotel._id.toString()] || 0;

      return {
        hotelId: hotel._id,
        customHotelId: hotel.hotelId,
        hotelName: hotel.hotelName,
        totalRooms,
        occupiedRooms: occupied,
        availableRooms: Math.max(0, totalRooms - occupied),
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
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getAvailableRooms,
  createRoomAllotment,
  getRoomAllotments,
  getHotelLists,
  updateRoomAllotmentStatus,
  updateRoomAllotment,
  getInventoryStatus,
};
