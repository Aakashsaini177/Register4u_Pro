const mongoose = require("mongoose");
require("dotenv").config();

const RoomAllotmentSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "HotelRoom" },
    occupancy: { type: Number, default: 1 },
    status: { type: String },
    checkInDate: Date,
    checkOutDate: Date,
  },
  { strict: false },
);

const HotelRoomSchema = new mongoose.Schema(
  {
    roomNumber: String,
    status: String, // available/occupied
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "HotelCategory" },
  },
  { strict: false },
);

const HotelCategorySchema = new mongoose.Schema(
  {
    categoryName: String,
    occupancy: Number,
  },
  { strict: false },
);

const RoomAllotment = mongoose.model("RoomAllotment", RoomAllotmentSchema);
const HotelRoom = mongoose.model("HotelRoom", HotelRoomSchema);
const HotelCategory = mongoose.model("HotelCategory", HotelCategorySchema);

async function runDebug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    // 1. Find Rooms 202 and 203
    const rooms = await HotelRoom.find({
      roomNumber: { $in: ["202", "203"] },
    }).populate("categoryId");

    for (const room of rooms) {
      console.log(`\n--------------------------------`);
      console.log(`🏠 Room: ${room.roomNumber} (ID: ${room._id})`);
      console.log(`   Internal Status: ${room.status}`);
      console.log(`   Max Capacity: ${room.categoryId?.occupancy}`);

      // 2. Find Allotments
      const allotments = await RoomAllotment.find({
        roomId: room._id,
        status: { $in: ["booked", "checked-in"] },
      });

      let totalOccupancy = 0;
      allotments.forEach((a) => {
        console.log(
          `   🎫 Allotment: Status=${a.status}, Pax=${a.occupancy}, In=${a.checkInDate?.toISOString().split("T")[0]}`,
        );
        totalOccupancy += a.occupancy || 1;
      });

      console.log(
        `   📊 Calculated Load: ${totalOccupancy} / ${room.categoryId?.occupancy}`,
      );

      const isFull = totalOccupancy >= (room.categoryId?.occupancy || 1);
      const shouldBe = isFull ? "occupied" : "available";

      if (room.status !== shouldBe) {
        console.log(
          `   ❌ MISMATCH! DB calls it '${room.status}', but it should be '${shouldBe}'`,
        );
      } else {
        console.log(`   ✅ Status matches logic.`);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
  }
}

runDebug();
