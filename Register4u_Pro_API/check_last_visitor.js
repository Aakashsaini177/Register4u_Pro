const mongoose = require("mongoose");
const { Visitor } = require("./src/models");
require("dotenv").config();

const checkVisitor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Find last created visitor
    const visitor = await Visitor.findOne().sort({ createdAt: -1 });
    console.log("Last Visitor:", visitor);
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
};

checkVisitor();
