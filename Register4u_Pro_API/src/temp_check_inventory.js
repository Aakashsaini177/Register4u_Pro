require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const { Hotel, HotelRoomInventory, RoomCategory } = require("./models");

const run = async () => {
  try {
    // console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
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
    console.error(e);
    process.exit(1);
  }
};
run();
