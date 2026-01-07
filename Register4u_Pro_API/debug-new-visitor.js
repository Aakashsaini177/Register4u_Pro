// Debug new visitor creation to see exact issue
const mongoose = require('mongoose');
require('dotenv').config();

async function debugNewVisitor() {
  try {
    console.log('🔍 Debugging new visitor creation...');
    
    // Connect to MongoDB with correct database name
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "r4u"
    });
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const { FileNode, Visitor } = require('./src/models');
    
    // Find the latest visitor (OP1001)
    const latestVisitor = await Visitor.findOne({ visitorId: 'OP1001' });
    
    if (latestVisitor) {
      console.log('👤 Found OP1001 visitor:');
      console.log(`   Name: ${latestVisitor.name}`);
      console.log(`   Photo URL in DB: ${latestVisitor.photo}`);
      
      if (latestVisitor.documents) {
        console.log('   Documents in DB:');
        Object.keys(latestVisitor.documents).forEach(docType => {
          if (latestVisitor.documents[docType]) {
            console.log(`     ${docType}: ${latestVisitor.documents[docType]}`);
          }
        });
      }
    } else {
      console.log('❌ OP1001 visitor not found');
    }
    
    // Check file manager entries for OP1001
    const photoFolder = await FileNode.findOne({
      name: 'photo',
      type: 'folder',
      parentId: null
    });
    
    if (photoFolder) {
      const photoFile = await FileNode.findOne({
        name: { $regex: /OP1001/i },
        parentId: photoFolder._id
      });
      
      if (photoFile) {
        console.log('\n📄 Found OP1001 photo in file manager:');
        console.log(`   Name: ${photoFile.name}`);
        console.log(`   URL in file manager: ${photoFile.url}`);
        
        if (photoFile.url.startsWith('/uploads/')) {
          console.log('   ⚠️  PROBLEM: File manager has local path!');
          
          if (latestVisitor && latestVisitor.photo && latestVisitor.photo.includes('cloudinary')) {
            console.log('   ✅ Visitor DB has Cloudinary URL');
            console.log('   🔧 Need to fix file manager entry');
          } else {
            console.log('   ❌ Visitor DB also has local path');
            console.log('   🔧 Need to fix both DB and file manager');
          }
        } else if (photoFile.url.includes('cloudinary')) {
          console.log('   ✅ File manager has Cloudinary URL');
        }
      } else {
        console.log('\n❌ OP1001 photo not found in file manager');
      }
    }
    
    // Check idproof folder
    const idproofFolder = await FileNode.findOne({
      name: 'idproof',
      type: 'folder',
      parentId: null
    });
    
    if (idproofFolder) {
      const idproofFiles = await FileNode.find({
        name: { $regex: /OP1001/i },
        parentId: idproofFolder._id
      });
      
      console.log(`\n🆔 Found ${idproofFiles.length} ID proof files for OP1001:`);
      idproofFiles.forEach(file => {
        console.log(`   📄 ${file.name}: ${file.url}`);
        if (file.url.includes('cloudinary')) {
          console.log('     ✅ Cloudinary URL (working correctly)');
        } else {
          console.log('     ⚠️  Local path (problem)');
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

debugNewVisitor();