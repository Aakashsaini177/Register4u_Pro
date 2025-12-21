// Create test employee via API
const axios = require('axios');

const API_BASE = 'http://localhost:4002/api/v1';

async function createTestEmployee() {
  try {
    console.log('🧪 Creating test employee via API...\n');

    // First, login as admin to get token
    console.log('1️⃣ Logging in as admin...');
    const adminLogin = await axios.post(`${API_BASE}/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (!adminLogin.data.success) {
      throw new Error('Admin login failed');
    }

    const adminToken = adminLogin.data.data.token;
    console.log('✅ Admin login successful');

    // Create employee
    console.log('\n2️⃣ Creating test employee...');
    try {
      const createEmployee = await axios.post(`${API_BASE}/createemployee`, {
        fullName: 'Test Employee',
        email: 'employee@example.com',
        contact: '9876543210',
        emp_type: 'permanent',
        department: 'IT',
        designation: 'Software Developer',
        status: 'active'
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (createEmployee.data.success) {
        console.log('✅ Test employee created successfully');
        console.log('   Employee ID:', createEmployee.data.data.id);
        
        // Enable login for the employee
        console.log('\n3️⃣ Enabling login for test employee...');
        const employeeId = createEmployee.data.data.id;
        
        const toggleLogin = await axios.post(`${API_BASE}/employees/${employeeId}/toggle-login`, {
          loginEnabled: true
        }, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (toggleLogin.data.success) {
          console.log('✅ Login enabled for test employee');
          console.log('   Username:', toggleLogin.data.data.username);
          console.log('   Default Password: employee@example.com');
        } else {
          console.log('❌ Failed to enable login:', toggleLogin.data.message);
        }
      }
    } catch (createError) {
      if (createError.response?.status === 400 && createError.response?.data?.message?.includes('duplicate')) {
        console.log('👤 Test employee already exists, trying to enable login...');
        
        // Get all employees to find the existing one
        const employees = await axios.post(`${API_BASE}/getAllEmployee`, {}, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });

        const testEmployee = employees.data.data.find(emp => emp.email === 'employee@example.com');
        
        if (testEmployee) {
          console.log('   Found existing employee ID:', testEmployee.id);
          
          // Try to enable login
          try {
            const toggleLogin = await axios.post(`${API_BASE}/employees/${testEmployee.id}/toggle-login`, {
              loginEnabled: true
            }, {
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
              }
            });

            if (toggleLogin.data.success) {
              console.log('✅ Login enabled for existing test employee');
            }
          } catch (toggleError) {
            console.log('❌ Failed to enable login:', toggleError.response?.data?.message || toggleError.message);
          }
        }
      } else {
        throw createError;
      }
    }

    console.log('\n🎉 Test employee setup complete!');
    console.log('📝 You can now test smart login with:');
    console.log('   Username: employee@example.com');
    console.log('   Password: employee@example.com');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

createTestEmployee();