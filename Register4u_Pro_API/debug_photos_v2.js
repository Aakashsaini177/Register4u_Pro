const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Visitor = require("./src/models/Visitor"); // Adjust path as needed
require("dotenv").config();

const checkPhotos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const visitors = await Visitor.find({}).limit(5); // Check first 5
    const UPLOADS_DIR = path.join(__dirname, "uploads");

    console.log("Uploads Dir:", UPLOADS_DIR);

    for (const v of visitors) {
      console.log(`\nVisitor: ${v.visitorId} (${v.name})`);
      console.log(`DB Photo Field: '${v.photo}'`);

      if (v.photo) {
        const filePath = path.join(UPLOADS_DIR, v.photo);
        const exists = fs.existsSync(filePath);
        console.log(`File exists at ${filePath}? ${exists}`);

        if (!exists) {
          // Check likely alternatives
          const extensions = [".jpg", ".jpeg", ".png", ".webp"];
          const baseName = v.photo.split(".")[0];
          for (const ext of extensions) {
            const altPath = path.join(UPLOADS_DIR, baseName + ext);
            if (fs.existsSync(altPath)) {
              console.log(`FOUND ALTERNATIVE: ${baseName + ext}`);
            }
          }
        }
      } else {
        console.log("No photo in DB");
      }
    }
    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

checkPhotos();
