const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/r4u",
      {
        dbName: "r4u",
      }
    );

    console.log(`✅✅✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌❌❌ Error: ${error.message}`);
    console.error("\n🔧 Check your .env file and ensure MONGO_URI is correct.");
    process.exit(1);
  }
};

module.exports = connectDB;
