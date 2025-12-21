const mongoose = require("mongoose");
require("dotenv").config();
const { Employee } = require("./src/models");

async function checkEmployees() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb+srv://register4u:register4u@cluster0.9tq1tu3.mongodb.net/r4u"
    );
    console.log("Connected to DB");

    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    employees.forEach((emp) => {
      console.log(
        `- Name: ${emp.fullName}, EmpType: ${emp.emp_type}, ID: ${emp._id}`
      );
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkEmployees();
