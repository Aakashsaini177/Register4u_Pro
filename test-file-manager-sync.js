/**
 * Quick test script to verify file manager sync functionality
 * Run this after implementing the changes
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:4002/api/v1'; // Adjust as needed
const AUTH_TOKEN = 'your-auth-token-here'; // Replace with actual token

// Test function
async function testFileManagerSync() {
  console.log('🧪 Testing File Manager Sync Implementation...\n');

  try {
    // 1. Test sync existing files
    console.log('1. Testing sync existing files...');
    const syncResponse = await axios.post(
      `${API_BASE_URL}/files/sync-existing`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Sync Response:', syncResponse.data);
    console.log('');

    // 2. Test file manager structure
    console.log('2. Testing file manager structure...');
    const listResponse = await axios.get(
      `${API_BASE_URL}/files/list`,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      }
    );

    const folders = listResponse.data.data || [];
    console.log('📁 Root folders found:');
    folders.forEach(folder => {
      if (folder.type === 'folder') {
        console.log(`   - ${folder.name}`);
      }
    });
    console.log('');

    // 3. Check specific folders
    const requiredFolders = ['photo', 'idproof', 'gst_certificate'];
    console.log('3. Checking required folders...');
    
    for (const folderName of requiredFolders) {
      const folder = folders.find(f => f.name === folderName && f.type === 'folder');
      if (folder) {
        console.log(`✅ ${folderName} folder exists`);
        
        // Get files in this folder
        const filesResponse = await axios.get(
          `${API_BASE_URL}/files/list?parentId=${folder._id}`,
          {
            headers: {
              'Authorization': `Bearer ${AUTH_TOKEN}`
            }
          }
        );
        
        const files = filesResponse.data.data || [];
        console.log(`   - Contains ${files.length} files`);
        
        // Show first few files as examples
        files.slice(0, 3).forEach(file => {
          if (file.type === 'file') {
            console.log(`     • ${file.name}`);
          }
        });
      } else {
        console.log(`❌ ${folderName} folder missing`);
      }
    }
    console.log('');

    console.log('🎉 File Manager Sync Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Instructions
console.log('📋 Instructions:');
console.log('1. Make sure your backend server is running');
console.log('2. Update API_BASE_URL if needed');
console.log('3. Replace AUTH_TOKEN with a valid token');
console.log('4. Run: node test-file-manager-sync.js');
console.log('');

// Uncomment the line below to run the test
// testFileManagerSync();

module.exports = { testFileManagerSync };