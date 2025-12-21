require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/database");
const { syncAllPortalAccounts } = require("./services/portalAccountService");

// Import models to establish associations
require("./models");

const PORT = process.env.PORT || 3000;

console.log("🔧 Environment Configuration:");
console.log("  PORT:", PORT);
console.log("  MONGO_URI:", process.env.MONGO_URI ? "Set (Hidden)" : "Not Set");
console.log("");

// Test database connection
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Ensure portal accounts exist for all records (optional)
    // Note: syncAllPortalAccounts might need to be updated for Mongoose
    if (process.env.AUTO_PORTAL_SYNC !== "false") {
      try {
        const syncResult = await syncAllPortalAccounts();
        console.log("✅ Portal accounts verified:", syncResult);
      } catch (syncError) {
        console.warn(
          "⚠️ Unable to sync portal accounts automatically:",
          syncError.message
        );
      }
    }

    // Start server
    app.listen(PORT, () => {
      console.log("🚀 Register4u Pro API Server Started");
      console.log(`📍 Server running on port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api/v1`);
      console.log("⏰ Started at:", new Date().toLocaleString());
      console.log("=====================================");
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

startServer();
