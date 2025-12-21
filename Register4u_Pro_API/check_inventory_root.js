require("dotenv").config();
const mongoose = require("mongoose");
const { Hotel, HotelRoomInventory } = require("./src/models");

console.log("Starting Inventory Check...");

const uri =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Register4u_Pro_DB";
console.log("Target URI:", uri.replace(/:.*@/, ":***@")); // Hide password if any

mongoose
  .connect(uri)
  .then(async () => {
    console.log("✅ Connected to MongoDB!");

    // 1. Check Hotels
    const hotels = await Hotel.find({ status: "active" });
    console.log(`\nFound ${hotels.length} ACTIVE Hotels:`);

    let totalRoomsSystem = 0;

    for (const h of hotels) {
      console.log(`\n🏨 ${h.hotelName} (ID: ${h._id})`);

      // 2. Check Inventory
      const inventories = await HotelRoomInventory.find({
        hotelId: h._id,
      }).populate("categoryId");

      if (inventories.length === 0) {
        console.log(`   ❌ NO INVENTORY FOUND for this hotel.`);
        continue;
      }

      let hotelTotal = 0;
      inventories.forEach((inv) => {
        if (inv.categoryId) {
          console.log(`   - ${inv.categoryId.name}: ${inv.totalRooms}`);
          hotelTotal += inv.totalRooms;
        } else {
          console.log(
            `   - [Orphaned Category]: ${inv.totalRooms} (Will be ignored)`
          );
        }
      });
      console.log(`   ➡️  Hotel Total: ${hotelTotal}`);
      totalRoomsSystem += hotelTotal;
    }

    console.log(`\n============================================`);
    console.log(`🌍 TOTAL SYSTEM ROOMS (Active Hotels): ${totalRoomsSystem}`);
    console.log(`============================================\n`);

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection/Query Error:", err);
    process.exit(1);
  });
