const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://Register_db_user:TQgcYVBHWRD27nQp@register4u.9tq1tu3.mongodb.net/register4u_pro?appName=Register4u";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to DB successfully");
    const HotelRoom = require("./src/models/HotelRoom");
    const count = await HotelRoom.countDocuments();
    console.log(`Total Rooms: ${count}`);
    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error("DB Connection Failed", err);
  });
