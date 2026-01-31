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
    status: String,
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

async function repair() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Repair Script Connected to DB");

    const rooms = await HotelRoom.find({}).populate("categoryId");
    console.log(`🔍 Checking ${rooms.length} rooms...`);

    let fixedCount = 0;

    for (const room of rooms) {
      if (!room.categoryId) continue;

      const capacity = room.categoryId.occupancy || 1;

      const allotments = await RoomAllotment.find({
        roomId: room._id,
        status: { $in: ["booked", "checked-in"] },
      });

      let currentLoad = 0;
      allotments.forEach((a) => {
        currentLoad += a.occupancy || 1;
      });

      let correctStatus = "available";
      if (currentLoad >= capacity) {
        correctStatus = "occupied";
      }

      if (room.status !== correctStatus) {
        console.log(
          `🛠️ FIXING Room ${room.roomNumber}: Was '${room.status}', Setting to '${correctStatus}' (Load: ${currentLoad}/${capacity})`,
        );

        await HotelRoom.findByIdAndUpdate(room._id, { status: correctStatus });
        fixedCount++;
      }
    }

    console.log(`\n🎉 Repair Complete! Fixed ${fixedCount} rooms.`);
  } catch (e) {
    console.error("Repair Failed:", e);
  } finally {
    mongoose.connection.close();
  }
}

repair();
