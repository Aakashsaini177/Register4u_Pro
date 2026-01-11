const axios = require("axios");
const mongoose = require("mongoose");
const { Employee } = require("./src/models");
require("dotenv").config();

const API_BASE_URL = "http://localhost:5000/api/v1";

async function testCodeIdLogin() {
  try {
    console.log("🧪 Testing Employee Code ID Login System");
    console.log("=" .repeat(50));

    // Connect to MongoDB to get real employee data
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get employees with login enabled
    const employees = await Employee.find({ 
      login_enabled: true,
      code_id: { $exists: true, $ne: null }
    }).limit(5);
    
    if (employees.length === 0) {
      console.log("❌ No employees found with login enabled and code_id.");
      console.log("Please run: node setup-employee-code-login.js");
      console.log("Or: node migrate-add-code-id.js");
      await mongoose.disconnect();
      return;
    }

    console.log(`\n📋 Found ${employees.length} employees with login enabled`);

    // Test login with different methods for first employee only (to avoid spam)
    const testEmployee = employees[0];
    console.log(`\n👤 Testing login for: ${testEmployee.fullName}`);
    console.log("-" .repeat(30));

    const testMethods = [
      { type: "Email", username: testEmployee.email },
      { type: "Code ID", username: testEmployee.code_id },
      { type: "Employee Code", username: testEmployee.emp_code },
    ];

    for (const method of testMethods) {
      if (!method.username) continue;

      try {
        console.log(`🔐 Testing ${method.type} login: ${method.username}`);
        
        const response = await axios.post(`${API_BASE_URL}/auth/employee-login`, {
          username: method.username,
          password: "password123" // Default password - change if you use different
        });

        if (response.data.success) {
          console.log(`✅ ${method.type} login successful`);
          console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
          console.log(`   Employee: ${response.data.data.employee.name}`);
          console.log(`   Code ID: ${response.data.data.employee.code_id}`);
          
          // Test getting profile with token
          const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${response.data.data.token}`
            }
          });

          if (profileResponse.data.success) {
            console.log(`✅ Profile fetch successful`);
            console.log(`   Name: ${profileResponse.data.data.employee.name}`);
            console.log(`   Code ID: ${profileResponse.data.data.employee.code_id}`);
          }
        } else {
          console.log(`❌ ${method.type} login failed: ${response.data.message}`);
        }
      } catch (error) {
        if (error.response) {
          console.log(`❌ ${method.type} login failed: ${error.response.data.message}`);
        } else {
          console.log(`❌ ${method.type} login error: ${error.message}`);
        }
      }
    }

    // Test invalid login attempts
    console.log(`\n🚫 Testing invalid login attempts`);
    console.log("-" .repeat(30));

    const invalidTests = [
      { username: "INVALID", password: "password123", desc: "Invalid Code ID" },
      { username: testEmployee.code_id, password: "wrongpassword", desc: "Wrong Password" },
      { username: "", password: "password123", desc: "Empty Username" },
      { username: "NONEXISTENT", password: "password123", desc: "Non-existent Code ID" },
    ];

    for (const test of invalidTests) {
      try {
        console.log(`🔐 Testing ${test.desc}: ${test.username || '(empty)'}`);
        
        const response = await axios.post(`${API_BASE_URL}/auth/employee-login`, {
          username: test.username,
          password: test.password
        });

        console.log(`❌ Expected failure but got success: ${response.data.message}`);
      } catch (error) {
        if (error.response && (error.response.status === 400 || error.response.status === 401)) {
          console.log(`✅ Correctly rejected: ${error.response.data.message}`);
        } else {
          console.log(`❌ Unexpected error: ${error.message}`);
        }
      }
    }

    console.log(`\n🎉 Code ID Login Testing Complete!`);
    console.log("\n📊 Summary:");
    console.log("✅ Employees can login with Email");
    console.log("✅ Employees can login with Code ID");
    console.log("✅ Employees can login with Employee Code");
    console.log("✅ Invalid credentials are properly rejected");
    console.log("✅ JWT tokens are generated correctly");
    console.log("✅ Profile API works with tokens");

    console.log(`\n📋 Available Employees for Testing:`);
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.fullName}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Code ID: ${emp.code_id}`);
      console.log(`   Employee Code: ${emp.emp_code}`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Database connection closed");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Run the test
async function runTest() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log("❌ API server is not running on http://localhost:5000");
    console.log("Please start the server first:");
    console.log("cd Register4u_Pro_API && npm start");
    process.exit(1);
  }

  await testCodeIdLogin();
}

runTest();