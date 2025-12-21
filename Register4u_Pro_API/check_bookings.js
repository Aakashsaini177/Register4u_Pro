const mongoose = require("mongoose");
const { RoomBooking } = require("./src/models");
require("dotenv").config();

const checkBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const bookings = await RoomBooking.find({});
    console.log(`Found ${bookings.length} Booking Records:`);
    console.log(JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
};

checkBookings();
