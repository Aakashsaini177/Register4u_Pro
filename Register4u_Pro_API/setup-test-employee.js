// Setup test employee for smart login testing
const mongoose = require('mongoose');
const { Employee } = require('./src/models');
const passwordManager = require('./src/utils/passwordManager');

async function setupTestEmployee() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://register4u:register4u@cluster0.9tq1tu3.mongodb.net/r4u');
    console.log('📊 Connected to MongoDB');

    // Check if test employee already exists
    let employee = await Employee.findOne({ email: 'employee@example.com' });
    
    if (!employee) {
      // Create test employee
      console.log('👤 Creating test employee...');
      employee = new Employee({
        fullName: 'Test Employee',
        email: 'employee@example.com',
        contact: '9876543210',
        emp_type: 'permanent',
        department: 'IT',
        designation: 'Software Developer',
        status: 'active'
      });
      
      await employee.save();
      console.log('✅ Test employee created');
    } else {
      console.log('👤 Test employee already exists');
    }

    // Enable login for the employee
    if (!employee.login_enabled) {
      console.log('🔐 Setting up login credentials...');
      
      const credentials = await passwordManager.setupDefaultCredentials(employee);
      
      await Employee.findByIdAndUpdate(employee._id, credentials);
      
      console.log('✅ Login credentials set up:');
      console.log('   Username:', credentials.username);
      console.log('   Password:', employee.email);
      console.log('   Login Enabled:', credentials.login_enabled);
    } else {
      console.log('🔐 Login already enabled for test employee');
    }

    console.log('\n🎉 Test employee setup complete!');
    console.log('📝 You can now test with:');
    console.log('   Username: employee@example.com');
    console.log('   Password: employee@example.com');
    
  } catch (error) {
    console.error('❌ Setup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

setupTestEmployee();