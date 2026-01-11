const mongoose = require("mongoose");
const { Employee } = require("./src/models");
require("dotenv").config();

async function migrateAddCodeId() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all employees without code_id
    const employeesWithoutCodeId = await Employee.find({
      $or: [
        { code_id: { $exists: false } },
        { code_id: null },
        { code_id: "" }
      ]
    });

    console.log(`\n📋 Found ${employeesWithoutCodeId.length} employees without code_id`);

    if (employeesWithoutCodeId.length === 0) {
      console.log("✅ All employees already have code_id assigned");
      await mongoose.disconnect();
      return;
    }

    console.log("\n🔧 Generating unique code_id for employees...");

    let updatedCount = 0;

    for (const employee of employeesWithoutCodeId) {
      // Generate unique code_id
      let isUnique = false;
      let codeId = null;

      while (!isUnique) {
        // Generate random 6 character alphanumeric code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Check if code_id exists
        const existing = await Employee.findOne({ code_id: code });
        if (!existing) {
          codeId = code;
          isUnique = true;
        }
      }

      // Update employee with new code_id
      await Employee.findByIdAndUpdate(employee._id, {
        code_id: codeId
      });

      updatedCount++;
      console.log(`✅ Updated ${employee.fullName} (${employee.email}) with code_id: ${codeId}`);
    }

    console.log(`\n🎉 Migration Complete!`);
    console.log(`📊 Updated ${updatedCount} employees with unique code_id`);

    // Verify the migration
    const allEmployees = await Employee.find({}, 'fullName email code_id emp_code');
    console.log(`\n📋 All Employees with Code IDs:`);
    console.log("=" .repeat(60));

    allEmployees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.fullName}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Code ID: ${emp.code_id}`);
      console.log(`   Employee Code: ${emp.emp_code}`);
      console.log("");
    });

    await mongoose.disconnect();
    console.log("✅ Database connection closed");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateAddCodeId();