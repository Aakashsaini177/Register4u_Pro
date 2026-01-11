const mongoose = require("mongoose");
const { Employee } = require("./src/models");
const passwordManager = require("./src/utils/passwordManager");
require("dotenv").config();

async function setupEmployeeCodeLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all existing employees and ensure they have code_id and login setup
    const existingEmployees = await Employee.find({});

    if (existingEmployees.length === 0) {
      console.log("❌ No employees found in database.");
      console.log("Please add employees first through your admin panel or API.");
      await mongoose.disconnect();
      return;
    }

    console.log(`\n🔧 Setting up code IDs and login for ${existingEmployees.length} existing employees...`);

    const updatedEmployees = [];

    for (const employee of existingEmployees) {
      let needsUpdate = false;
      
      // Ensure code_id is generated if missing
      if (!employee.code_id) {
        let isUnique = false;
        while (!isUnique) {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let code = '';
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }

          const existing = await Employee.findOne({ code_id: code });
          if (!existing) {
            employee.code_id = code;
            needsUpdate = true;
            isUnique = true;
          }
        }
      }

      // Set up login credentials if not already set
      if (!employee.password || !employee.login_enabled) {
        const defaultPassword = "password123"; // Default password - change as needed
        const passwordData = await passwordManager.preparePasswordData(defaultPassword);

        await Employee.findByIdAndUpdate(employee._id, {
          username: employee.email,
          password: passwordData.hashedPassword,
          password_plain: passwordData.encryptedPassword,
          login_enabled: true,
          login_created_at: new Date(),
          login_updated_at: new Date(),
          code_id: employee.code_id,
        });

        console.log(`✅ Login setup for: ${employee.fullName}`);
        console.log(`   📧 Email: ${employee.email}`);
        console.log(`   🔑 Code ID: ${employee.code_id}`);
        console.log(`   👤 Employee Code: ${employee.emp_code}`);
        console.log(`   🔐 Default Password: password123 (please change after first login)`);
        console.log("");
      } else if (needsUpdate) {
        // Just update code_id if login already exists
        await Employee.findByIdAndUpdate(employee._id, {
          code_id: employee.code_id,
        });

        console.log(`✅ Code ID added for: ${employee.fullName}`);
        console.log(`   🔑 Code ID: ${employee.code_id}`);
        console.log("");
      } else {
        console.log(`✅ Already configured: ${employee.fullName} (${employee.code_id})`);
      }

      // Refresh employee data
      const updatedEmployee = await Employee.findById(employee._id);
      updatedEmployees.push(updatedEmployee);
    }

    console.log("🎉 Employee Code Login System Setup Complete!");
    console.log(`\n📊 Summary: ${updatedEmployees.length} employees configured`);
    
    console.log("\n🚀 Login Methods Available:");
    console.log("1. Email + Password");
    console.log("2. Code ID + Password");
    console.log("3. Employee Code + Password");
    
    console.log("\n📝 Next Steps:");
    console.log("1. Employees can login using any of the three methods above");
    console.log("2. Default password is 'password123' - ask employees to change it");
    console.log("3. Test the system with: node test-code-id-login.js");

    await mongoose.disconnect();
    console.log("\n✅ Database connection closed");

  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

// Run the setup
setupEmployeeCodeLogin();