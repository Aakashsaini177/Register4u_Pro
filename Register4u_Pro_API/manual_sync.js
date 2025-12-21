require("dotenv").config();
const mongoose = require("mongoose");
const {
  syncAllPortalAccounts,
} = require("./src/services/portalAccountService");

// Use hardcoded URI if env not picked up, assuming standard local dev
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/register4u-pro";

const runSync = async () => {
  try {
    console.log("Connecting to MongoDB at " + MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected. Starting Sync...");

    const results = await syncAllPortalAccounts();
    console.log("Sync Results:", results);

    console.log("Sync Completed.");
    process.exit(0);
  } catch (error) {
    console.error("Sync Failed:", error);
    process.exit(1);
  }
};

runSync();
