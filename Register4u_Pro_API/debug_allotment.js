const mongoose = require("mongoose");
const { RoomAllotment, Hotel } = require("./src/models");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();

  // Find The Leela Palace
  const hotel = await Hotel.findOne({ hotelName: "The Leela Palace" });
  if (!hotel) {
    console.log("Hotel not found");
    return;
  }
  console.log(`Checking Allotments for: ${hotel.hotelName} (${hotel._id})`);

  const allotments = await RoomAllotment.find({ hotelId: hotel._id }).populate(
    "roomId"
  );

  console.log(`Found ${allotments.length} allotments:`);
  allotments.forEach((a) => {
    console.log(`ID: ${a._id}`);
    console.log(`  Visitor: ${a.visitorId}`);
    console.log(`  Room: ${a.roomId?.roomNumber}`);
    console.log(`  Status: ${a.status}`);
    console.log(`  CheckIn: ${a.checkInDate} (Type: ${typeof a.checkInDate})`);
    console.log(
      `  CheckOut: ${a.checkOutDate} (Type: ${typeof a.checkOutDate})`
    );
    console.log("---");
  });

  process.exit(0);
};

run();
