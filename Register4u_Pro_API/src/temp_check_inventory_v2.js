const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") }); // Absolute path resolution
const mongoose = require("mongoose");
const { Hotel, HotelRoomInventory, RoomCategory } = require("./models");

const run = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log("Attempting to connect to DB...");
    if (!uri) {
      throw new Error("MONGO_URI is undefined. Check .env path.");
    }

    await mongoose.connect(uri);
    console.log("✅ Connected to DB\n");

    const hotels = await Hotel.find({ status: "active" });
    console.log(`🔍 Found ${hotels.length} active hotels.\n`);

    let grandTotal = 0;

    for (const hotel of hotels) {
      console.log(`🏨 ${hotel.hotelName}`);
      const inventories = await HotelRoomInventory.find({
        hotelId: hotel._id,
      }).populate("categoryId");

      if (inventories.length === 0) {
        console.log("   ⚠️ No inventory defined.");
      }

      let hotelTotal = 0;
      inventories.forEach((inv) => {
        if (inv.categoryId) {
          console.log(
            `   - ${inv.categoryId.name.padEnd(15)}: ${inv.totalRooms}`
          );
          hotelTotal += inv.totalRooms;
        } else {
          console.log(
            `   - [Deleted Cat]  : ${inv.totalRooms} (Ignored in Report)`
          );
        }
      });
      console.log(`   ---------------------------`);
      console.log(`   Total            : ${hotelTotal}`);
      console.log(``);
      grandTotal += hotelTotal;
    }

    console.log(`===================================`);
    console.log(`🏛️  GRAND TOTAL ROOMS : ${grandTotal}`);
    console.log(`===================================`);

    process.exit(0);
  } catch (e) {
    console.error("❌ CRTICAL ERROR:", e.message);
    process.exit(1);
  }
};
run();
