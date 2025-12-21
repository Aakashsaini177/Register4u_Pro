const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");
require("dotenv").config({
  path: "D:\\Register4u_Pro\\Register4u_Pro_API\\.env",
});

async function run() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();

    // Check EX1242
    const visitorId = "EX1242";
    // Try both 'test' and standard DB if known, but previous run worked with default
    const visitors = client.db("test").collection("visitors");
    const visitor = await visitors.findOne({ visitorId: visitorId });

    if (!visitor) {
      console.log(`❌ Visitor ${visitorId} not found in DB`);
    } else {
      console.log(`👤 Visitor: ${visitor.name}`);
      console.log(`🖼️  DB Photo Field: '${visitor.photo}'`);

      if (!visitor.photo) {
        console.log("⚠️  No photo field");
      } else {
        const uploadDir = path.join(__dirname, "uploads");

        // Handle both legacy "uploads/" prefix and clean filenames
        const cleanName = visitor.photo.replace(/^uploads[\\/]/, "");

        const pathsToCheck = [
          path.join(uploadDir, visitor.photo),
          path.join(uploadDir, cleanName),
        ];

        let found = false;
        for (const p of pathsToCheck) {
          if (fs.existsSync(p)) {
            console.log(`✅ File EXISTS on Disk: ${p}`);
            found = true;
          } else {
            console.log(`❌ Checked: ${p} (Missing)`);
          }
        }

        if (!found) console.log("🚨 FILE MISSING FROM DISK");
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
