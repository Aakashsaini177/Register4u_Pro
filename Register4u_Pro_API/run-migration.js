const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'r4u',
    multipleStatements: true
  });

  try {
    console.log('🔄 Starting database migration...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_add_employee_login_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await connection.execute(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Added login fields to Employee table');
    console.log('📊 Created user_sessions table');
    console.log('📊 Created password_history table');
    console.log('📊 Set default login credentials for existing employees');
    
    // Verify the changes
    const [employees] = await connection.execute(
      'SELECT id, fullName, email, username, login_enabled FROM Employee WHERE login_enabled = TRUE LIMIT 5'
    );
    
    console.log('\n📋 Sample employees with login enabled:');
    employees.forEach(emp => {
      console.log(`   ${emp.fullName} - ${emp.username} (${emp.login_enabled ? 'Enabled' : 'Disabled'})`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run migration
runMigration();