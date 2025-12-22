const mongoose = require("mongoose");
const { FileNode } = require("./src/models");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath });

const run = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Register4u_Pro"
    );

    console.log("Searching for specific nodes shown in screenshot...");
    const names = ["EHB0001.JPG", "EX1007.jpg", "EX1012.jpg"];
    const nodes = await FileNode.find({ name: { $in: names } });

    console.log(`Found ${nodes.length} nodes.`);
    nodes.forEach((n) => {
      console.log("---------------------------------------------------");
      console.log(`Name: ${n.name}`);
      console.log(`Type: ${n.type}`);
      console.log(`URL:  ${n.url}`);
      console.log(`Mime: ${n.mimeType}`);
      console.log("---------------------------------------------------");
    });

    // Also check one that MIGHT be working or a generic one
    const oneFile = await FileNode.findOne({ type: "file" }).sort({
      createdAt: -1,
    });
    if (oneFile) {
      console.log("Most recently created file:");
      console.log(`Name: ${oneFile.name}`);
      console.log(`URL:  ${oneFile.url}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
};

run();
