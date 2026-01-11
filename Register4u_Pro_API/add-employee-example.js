const mongoose = require("mongoose");
const { Employee } = require("./src/models");
const passwordManager = require("./src/utils/passwordManager");
require("dotenv").config();

async function addEmployee() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Example: Add a real employee
    const employeeData = {
      fullName: "Your Employee Name",
      email: "employee@yourcompany.com",
      phone: "1234567890",
      emp_type: "permanent", // or "volunteer", "help_desk", etc.
      department: "Your Department",
      designation: "Employee Designation",
      status: "active",
      login_enabled: true,
    };

    console.log("\n➕ Adding new employee...");

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email: employeeData.email });
    
    if (existingEmployee) {
      console.log(`❌ Employee with email ${employeeData.email} already exists`);
      await mongoose.disconnect();
      return;
    }

    // Create new employee (code_id and emp_code will be auto-generated)
    const employee = new Employee(employeeData);
    await employee.save();

    // Set up login credentials
    const defaultPassword = "password123";
    const passwordData = await passwordManager.preparePasswordData(defaultPassword);

    await Employee.findByIdAndUpdate(employee._id, {
      username: employee.email,
      password: passwordData.hashedPassword,
      password_plain: passwordData.encryptedPassword,
      login_enabled: true,
      login_created_at: new Date(),
      login_updated_at: new Date(),
    });

    // Get updated employee data
    const updatedEmployee = await Employee.findById(employee._id);

    console.log("✅ Employee added successfully!");
    console.log(`   📧 Email: ${updatedEmployee.email}`);
    console.log(`   🔑 Code ID: ${updatedEmployee.code_id}`);
    console.log(`   👤 Employee Code: ${updatedEmployee.emp_code}`);
    console.log(`   🔐 Password: ${defaultPassword}`);
    console.log(`   📱 Phone: ${updatedEmployee.phone}`);
    console.log(`   🏢 Department: ${updatedEmployee.department}`);
    console.log(`   💼 Designation: ${updatedEmployee.designation}`);

    console.log("\n🚀 Login Methods Available:");
    console.log(`   - Email: ${updatedEmployee.email}`);
    console.log(`   - Code ID: ${updatedEmployee.code_id}`);
    console.log(`   - Employee Code: ${updatedEmployee.emp_code}`);
    console.log(`   - Password: ${defaultPassword}`);

    await mongoose.disconnect();
    console.log("\n✅ Database connection closed");

  } catch (error) {
    console.error("❌ Failed to add employee:", error);
    process.exit(1);
  }
}

// Instructions
console.log("📝 Employee Addition Example");
console.log("=" .repeat(40));
console.log("This script shows how to add a single employee.");
console.log("Edit the employeeData object above with real employee information.");
console.log("");

// Run the function
addEmployee();