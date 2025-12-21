const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({
  path: "D:\\Register4u_Pro\\Register4u_Pro_API\\.env",
});

const Visitor = require("./src/models/Visitor");
// Dummy model registrations to prevent missing schema errors
if (!mongoose.models.TravelDetail) require("./src/models/TravelDetail");
if (!mongoose.models.Hotel) require("./src/models/Hotel");
if (!mongoose.models.Driver) require("./src/models/Driver");
if (!mongoose.models.HotelCategory) require("./src/models/HotelCategory");
if (!mongoose.models.Invite) require("./src/models/Invite");
if (!mongoose.models.Category) require("./src/models/Category");
if (!mongoose.models.ActivityLog) require("./src/models/ActivityLog");
if (!mongoose.models.FileNode) require("./src/models/FileNode");

const checkPhoto = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check EX1242 specifically as seen in screenshot
    const visitorId = "EX1242";
    const visitor = await Visitor.findOne({ visitorId: visitorId });

    if (!visitor) {
      console.log(`❌ Visitor ${visitorId} not found in DB`);
    } else {
      console.log(`👤 Visitor: ${visitor.name} (${visitor.visitorId})`);
      console.log(`🖼️  DB Photo Field: '${visitor.photo}'`);

      if (!visitor.photo) {
        console.log("⚠️  No photo field in DB");
      } else {
        const uploadDir = path.join(__dirname, "uploads");
        const filePath = path.join(uploadDir, visitor.photo);

        // Also check if it might be prefixed with "uploads/" in DB
        const cleanName = visitor.photo.replace(/^uploads[\\/]/, "");
        const cleanNameSlash = visitor.photo.replace(/^uploads\//, "");

        const possiblePaths = [
          path.join(uploadDir, visitor.photo), // As is
          path.join(uploadDir, cleanName), // Cleaned backslash
          path.join(uploadDir, cleanNameSlash), // Cleaned forward slash
        ];

        let found = false;
        for (const p of possiblePaths) {
          console.log(`📂 Checking path: ${p}`);
          if (fs.existsSync(p)) {
            console.log(`✅ File EXISTS at: ${p}`);
            found = true;
            break;
          }
        }

        if (!found) {
          console.log("❌ File NOT FOUND at any expected path");
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

checkPhoto();
