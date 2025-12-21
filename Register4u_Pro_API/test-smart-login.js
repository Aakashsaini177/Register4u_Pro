// Test script for smart login system
const axios = require('axios');

const API_BASE = 'http://localhost:4003/api/v1';

async function testSmartLogin() {
  console.log('🧪 Testing Smart Auto-Detection Login System\n');

  // Test 1: Admin Login
  console.log('1️⃣ Testing Admin Login...');
  try {
    const adminResponse = await axios.post(`${API_BASE}/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (adminResponse.data.success) {
      console.log('✅ Admin login successful!');
      console.log('   User Type:', adminResponse.data.data.user.type);
      console.log('   Role:', adminResponse.data.data.user.role);
      console.log('   Name:', adminResponse.data.data.user.name);
    }
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
  }

  console.log('\n');

  // Test 2: Employee Login (if exists)
  console.log('2️⃣ Testing Employee Login...');
  try {
    const employeeResponse = await axios.post(`${API_BASE}/login`, {
      username: 'employee@example.com',
      password: 'employee@example.com'
    });
    
    if (employeeResponse.data.success) {
      console.log('✅ Employee login successful!');
      console.log('   User Type:', employeeResponse.data.data.user.type);
      console.log('   Role:', employeeResponse.data.data.user.role);
      console.log('   Name:', employeeResponse.data.data.user.name);
    }
  } catch (error) {
    console.log('❌ Employee login failed:', error.response?.data?.message || error.message);
  }

  console.log('\n');

  // Test 3: Invalid Login
  console.log('3️⃣ Testing Invalid Login...');
  try {
    const invalidResponse = await axios.post(`${API_BASE}/login`, {
      username: 'invalid',
      password: 'invalid'
    });
    
    console.log('❌ Invalid login should have failed but succeeded');
  } catch (error) {
    console.log('✅ Invalid login correctly rejected:', error.response?.data?.message || error.message);
  }

  console.log('\n🎉 Smart Login Test Complete!');
}

testSmartLogin().catch(console.error);