const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({
  path: "D:\\Register4u_Pro\\Register4u_Pro_API\\.env",
});

// Minimal Schema
const visitorSchema = new mongoose.Schema(
  {
    visitorId: String,
    name: String,
    photo: String,
  },
  { strict: false }
);
const Visitor = mongoose.model("Visitor", visitorSchema);

const auditPhotos = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected. Auditing all visitors...");

    const visitors = await Visitor.find({}).sort({ createdAt: -1 });
    console.log(`📊 Total Visitors: ${visitors.length}`);

    let validPhotos = 0;
    let missingPhotos = 0;
    let noPhotoField = 0;

    const uploadDir = path.join(__dirname, "uploads");

    for (const v of visitors) {
      if (!v.photo) {
        noPhotoField++;
        continue;
      }

      // Clean path logic mimicking backend/frontend
      let cleanName = v.photo;
      if (cleanName.startsWith("http")) {
        // External/Full URL - assume valid for this count or check linkage?
        // If it points to localhost, we can check file.
        if (cleanName.includes("/uploads/")) {
          cleanName = cleanName.split("/uploads/")[1];
        } else {
          // True external
          validPhotos++;
          continue;
        }
      }

      cleanName = cleanName.replace(/^uploads[\\/]/, "").replace(/^\//, "");

      // Check file existence
      const p = path.join(uploadDir, cleanName);
      if (fs.existsSync(p)) {
        validPhotos++;
        // console.log(`✅ [${v.visitorId}] Valid: ${cleanName}`);
      } else {
        missingPhotos++;
        console.log(
          `❌ [${v.visitorId}] MISSING FILE: '${v.photo}' (checked: ${cleanName})`
        );
      }
    }

    console.log("\n--- SUMMARY ---");
    console.log(`Total: ${visitors.length}`);
    console.log(`✅ Valid Photos (File Exists): ${validPhotos}`);
    console.log(`⚠️  No Photo Set in DB: ${noPhotoField}`);
    console.log(`❌ Photo Set but File Missing: ${missingPhotos}`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

auditPhotos();
