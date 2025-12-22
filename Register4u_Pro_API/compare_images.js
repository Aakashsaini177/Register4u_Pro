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

    console.log("--- querying specific nodes ---");
    const names = ["EHB0001.JPG", "EX1007.jpg"];
    const nodes = await FileNode.find({ name: { $in: names } });

    nodes.forEach((n) => {
      console.log("---------------------------------------------------");
      console.log(`Name: ${n.name}`);
      console.log(`URL:  ${n.url}`);
      console.log(`Type: ${n.type}`);
      console.log("---------------------------------------------------");
    });
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
};

run();
