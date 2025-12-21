const mongoose = require('mongoose');
const { Employee } = require('./src/models');
const passwordManager = require('./src/utils/passwordManager');
require('dotenv').config();

async function setupDefaultCredentials() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/register4u', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');

    // Find all employees without login credentials
    const employees = await Employee.find({
      email: { $exists: true, $ne: '' },
      $or: [
        { login_enabled: { $exists: false } },
        { login_enabled: false },
        { username: { $exists: false } },
        { username: null }
      ]
    });

    console.log(`📋 Found ${employees.length} employees to set up login credentials`);

    let setupCount = 0;

    for (const employee of employees) {
      try {
        if (!employee.email) {
          console.log(`⚠️  Skipping ${employee.fullName} - no email`);
          continue;
        }

        // Set up default credentials
        const credentials = await passwordManager.setupDefaultCredentials(employee);
        
        // Update employee with login credentials
        await Employee.findByIdAndUpdate(employee._id, credentials);
        
        console.log(`✅ Set up login for: ${employee.fullName} (${employee.email})`);
        setupCount++;
        
      } catch (error) {
        console.error(`❌ Failed to set up login for ${employee.fullName}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully set up login credentials for ${setupCount} employees`);
    console.log('\n📋 Default credentials:');
    console.log('   Username: employee email');
    console.log('   Password: employee email');
    console.log('\n💡 Employees can change their password after first login');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run setup
setupDefaultCredentials();