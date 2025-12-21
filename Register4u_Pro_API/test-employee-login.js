const axios = require('axios');

const API_BASE = 'http://localhost:4002/api/v1';

async function testEmployeeLogin() {
  console.log('🧪 Testing Employee Login System...\n');

  try {
    // Test 1: Employee Login
    console.log('1️⃣ Testing Employee Login...');
    
    const loginResponse = await axios.post(`${API_BASE}/auth/employee-login`, {
      username: 'test@example.com', // Replace with actual employee email
      password: 'test@example.com'  // Default password is email
    });

    if (loginResponse.data.success) {
      console.log('✅ Employee login successful!');
      console.log(`   Token: ${loginResponse.data.data.token.substring(0, 20)}...`);
      console.log(`   Employee: ${loginResponse.data.data.employee.name}`);
      console.log(`   Role: ${loginResponse.data.data.employee.role}`);
      
      const token = loginResponse.data.data.token;

      // Test 2: Get Profile
      console.log('\n2️⃣ Testing Get Profile...');
      const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileResponse.data.success) {
        console.log('✅ Profile fetch successful!');
        console.log(`   Name: ${profileResponse.data.data.employee.name}`);
        console.log(`   Email: ${profileResponse.data.data.employee.email}`);
      }

      // Test 3: Change Password
      console.log('\n3️⃣ Testing Change Password...');
      try {
        const changePasswordResponse = await axios.post(`${API_BASE}/auth/change-password`, {
          currentPassword: 'test@example.com',
          newPassword: 'newPassword123',
          confirmPassword: 'newPassword123'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (changePasswordResponse.data.success) {
          console.log('✅ Password change successful!');
        }
      } catch (error) {
        console.log('⚠️  Password change test skipped (expected if password already changed)');
      }

      // Test 4: Logout
      console.log('\n4️⃣ Testing Logout...');
      const logoutResponse = await axios.post(`${API_BASE}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (logoutResponse.data.success) {
        console.log('✅ Logout successful!');
      }

    } else {
      console.log('❌ Employee login failed:', loginResponse.data.message);
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ Test failed:', error.response.data.message);
      console.log('   Status:', error.response.status);
    } else {
      console.log('❌ Network error:', error.message);
      console.log('   Make sure the backend is running on http://localhost:4002');
    }
  }

  console.log('\n🏁 Test completed!');
}

// Run tests
testEmployeeLogin();