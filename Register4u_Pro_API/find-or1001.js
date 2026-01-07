// Find OR1001 visitor specifically
const mongoose = require('mongoose');
require('dotenv').config();

async function findOR1001() {
  try {
    console.log('🔍 Looking for OR1001 visitor...');
    
    // Connect to MongoDB with correct database name
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "r4u"
    });
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // Import models
    const { FileNode, Visitor } = require('./src/models');
    
    // Search for OR1001 visitor
    const visitor = await Visitor.findOne({ visitorId: 'OR1001' });
    
    if (visitor) {
      console.log('👤 Found OR1001 visitor:');
      console.log(`   Name: ${visitor.name}`);
      console.log(`   Photo: ${visitor.photo}`);
      console.log(`   Created: ${visitor.createdAt}`);
      if (visitor.documents) {
        console.log('   Documents:');
        Object.keys(visitor.documents).forEach(docType => {
          if (visitor.documents[docType]) {
            console.log(`     ${docType}: ${visitor.documents[docType]}`);
          }
        });
      }
    } else {
      console.log('❌ OR1001 visitor not found');
    }
    
    // Search for OR1001 in file manager
    const photoFile = await FileNode.findOne({ 
      name: { $regex: /OR1001/i }
    });
    
    if (photoFile) {
      console.log('\n📄 Found OR1001 file in file manager:');
      console.log(`   Name: ${photoFile.name}`);
      console.log(`   URL: ${photoFile.url}`);
      console.log(`   Parent: ${photoFile.parentId}`);
      
      // Get parent folder info
      const parentFolder = await FileNode.findById(photoFile.parentId);
      if (parentFolder) {
        console.log(`   Folder: ${parentFolder.name}`);
      }
    } else {
      console.log('\n❌ OR1001 file not found in file manager');
    }
    
    // Count total visitors and files
    const totalVisitors = await Visitor.countDocuments();
    const totalFiles = await FileNode.countDocuments({ type: 'file' });
    const totalFolders = await FileNode.countDocuments({ type: 'folder' });
    
    console.log(`\n📊 Database totals:`);
    console.log(`   Visitors: ${totalVisitors}`);
    console.log(`   Files: ${totalFiles}`);
    console.log(`   Folders: ${totalFolders}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

findOR1001();