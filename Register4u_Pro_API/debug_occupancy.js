const mongoose = require("mongoose");
const HotelRoom = require("./src/models/HotelRoom");
const RoomAllotment = require("./src/models/RoomAllotment");
const Hotel = require("./src/models/Hotel");
const fs = require("fs");

// Connect to MongoDB
const MONGO_URI =
  "mongodb+srv://Register_db_user:TQgcYVBHWRD27nQp@register4u.9tq1tu3.mongodb.net/register4u_pro?appName=Register4u";

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync("debug_output.txt", msg + "\n");
};

const run = async () => {
  try {
    fs.writeFileSync("debug_output.txt", "Starting Debug Script\n");

    await mongoose.connect(MONGO_URI);
    log("Connected to DB");

    // 1. Find Room 202
    // We need to find the Hotel first or just search by roomNumber
    log("Searching for Room 202...");
    const rooms = await HotelRoom.find({ roomNumber: "202" }).populate(
      "categoryId",
    );
    log(`Found ${rooms.length} rooms with number 202`);

    if (rooms.length === 0) {
      log("NO ROOM FOUND! Check checks.");
      // List all rooms briefly
      const allRooms = await HotelRoom.find().limit(5);
      log(`Sample Rooms: ${allRooms.map((r) => r.roomNumber).join(",")}`);
    }

    for (const room of rooms) {
      log(`\n--- Room ${room._id} (Hotel: ${room.hotelId}) ---`);
      log(
        `Category: ${room.categoryId?.categoryName}, MaxOcc: ${room.categoryId?.occupancy}`,
      );
      log(`Static Status: ${room.status}`);

      // 2. Find Allotments for this room
      const allotments = await RoomAllotment.find({ roomId: room._id });
      log(`Found ${allotments.length} allotments for this room:`);

      allotments.forEach((a) => {
        log(` - ID: ${a._id}`);
        log(`   Visitor: ${a.visitorName} (${a.visitorId})`);
        log(
          `   Dates: ${a.checkInDate ? a.checkInDate.toISOString() : "N/A"} to ${a.checkOutDate ? a.checkOutDate.toISOString() : "N/A"}`,
        );
        log(`   Status: ${a.status}`);
        log(`   Occupancy: ${a.occupancy} (Type: ${typeof a.occupancy})`);
      });

      // 3. Test Availability Logic
      // Simulate getAvailableRooms logic for a specific date
      const checkIn = new Date("2026-01-30");
      const checkOut = new Date("2026-01-31");

      log(
        `\nChecking conflict for ${checkIn.toISOString()} to ${checkOut.toISOString()}`,
      );

      const conflicting = allotments.filter((a) => {
        const isActive = ["booked", "checked-in"].includes(a.status);
        // Overlap: StartA < EndB && EndA > StartB
        const cIn = new Date(a.checkInDate);
        const cOut = new Date(a.checkOutDate);
        const isOverlapping = cIn < checkOut && cOut > checkIn;

        log(
          `   -> Allotment ${a._id}: Active=${isActive}, IsOverlapping=${isOverlapping}`,
        );
        return isActive && isOverlapping;
      });

      log(`\nConflicting Allotments: ${conflicting.length}`);
      const currentLoad = conflicting.reduce(
        (sum, a) => sum + (parseInt(a.occupancy) || 1),
        0,
      );
      log(`Calculated Load: ${currentLoad}`);
      log(`Max Capacity: ${room.categoryId?.occupancy || 1}`);
      log(
        `Result: ${currentLoad < (room.categoryId?.occupancy || 1) ? "AVAILABLE" : "FULL"}`,
      );
    }
  } catch (e) {
    log("ERROR: " + e.message);
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
};

run();
