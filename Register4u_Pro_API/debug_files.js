const mongoose = require("mongoose");
const { FileNode } = require("./src/models");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load env from specific path
const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath });

const run = async () => {
  try {
    console.log("Loading .env from:", envPath);
    console.log("MONGO_URI:", process.env.MONGO_URI);

    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Register4u_Pro"
    );
    console.log("Connected to DB");

    const count = await FileNode.countDocuments();
    console.log(`Total FileNodes in DB: ${count}`);

    const nodes = await FileNode.find({}).limit(5);
    console.log("--- Sample Nodes ---");
    nodes.forEach((n) => {
      console.log(JSON.stringify(n, null, 2));
    });
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
};

run();
