const mongoose = require("mongoose");
const XLSX = require("xlsx");
// Import models individually to avoid index.js issues
const TravelDetail = require("./src/models/TravelDetail");
const RoomAllotment = require("./src/models/RoomAllotment");
const DriverAllotment = require("./src/models/DriverAllotment");
const Hotel = require("./src/models/Hotel");
const HotelRoom = require("./src/models/HotelRoom");
const Driver = require("./src/models/Driver");
const HotelCategory = require("./src/models/HotelCategory");

require("dotenv").config();

const testExport = async () => {
  try {
    console.log("URI:", process.env.MONGO_URI ? "Defined" : "UNDEFINED");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const query = {};

    console.log("Fetching Data...");
    const travelDetails = await TravelDetail.find(query)
      .populate({
        path: "hotelAllotments",
        populate: [
          { path: "hotelId", model: "Hotel" },
          { path: "roomId", model: "HotelRoom" },
        ],
      })
      .populate({
        path: "driverAllotments",
        populate: { path: "driverId", model: "Driver" },
      });

    console.log(`Fetched ${travelDetails.length} records.`);

    const data = travelDetails.map((td, index) => {
      // Helper to format date
      const formatDate = (d) =>
        d ? new Date(d).toISOString().split("T")[0] : "";

      const hotel = td.hotelAllotments?.[0]?.hotelId?.hotelName || "";
      const room = td.hotelAllotments?.[0]?.roomId?.roomNumber || "";

      const driver = td.driverAllotments?.[0]?.driverId?.driverName || "";
      const vehicle = td.driverAllotments?.[0]?.driverId?.vehicleNumber || "";
      const driverContact =
        td.driverAllotments?.[0]?.driverId?.contactNumber || "";

      return {
        "S.No": index + 1,
        "Visitor Name": td.visitorName,
        Arrival: formatDate(td.arrivalDate),
        Hotel: hotel,
        Room: room,
        Driver: driver,
      };
    });

    console.log("Generating Sheet...");
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Travel Report");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    console.log("Buffer generated size:", buffer.length);
    console.log("SUCCESS");
  } catch (error) {
    console.error("CRASHED:", error);
  } finally {
    mongoose.connection.close();
  }
};

testExport();
