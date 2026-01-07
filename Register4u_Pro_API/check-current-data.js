// Check current visitor and file manager data
const mongoose = require('mongoose');
require('dotenv').config();

async function checkCurrentData() {
  try {
    console.log('🔍 Checking current data...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const { FileNode, Visitor } = require('./src/models');
    
    // Get all visitors
    const visitors = await Visitor.find({}).select('name visitorId photo documents').sort({ createdAt: -1 }).limit(5);
    
    console.log(`👥 Found ${visitors.length} recent visitors:`);
    visitors.forEach(visitor => {
      console.log(`\n👤 ${visitor.name} (${visitor.visitorId})`);
      console.log(`   Photo: ${visitor.photo || 'No photo'}`);
      if (visitor.documents) {
        Object.keys(visitor.documents).forEach(docType => {
          if (visitor.documents[docType]) {
            console.log(`   ${docType}: ${visitor.documents[docType]}`);
          }
        });
      }
    });
    
    // Get all file manager entries
    console.log('\n📁 File Manager Structure:');
    
    const rootFolders = await FileNode.find({
      type: 'folder',
      parentId: null
    });
    
    for (const folder of rootFolders) {
      console.log(`\n📁 ${folder.name} folder:`);
      const files = await FileNode.find({
        parentId: folder._id,
        type: 'file'
      });
      
      console.log(`   Contains ${files.length} files`);
      files.forEach(file => {
        console.log(`   📄 ${file.name}: ${file.url}`);
        if (file.url.includes('cloudinary')) {
          console.log('      ✅ Cloudinary URL');
        } else if (file.url.startsWith('/uploads/')) {
          console.log('      ⚠️  Local path');
        } else {
          console.log('      ❓ Other format');
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkCurrentData();