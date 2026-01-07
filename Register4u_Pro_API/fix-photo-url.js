// Fix photo URL in file manager
const mongoose = require('mongoose');
require('dotenv').config();

async function fixPhotoURL() {
  try {
    console.log('🔧 Fixing photo URL in file manager...');
    
    // Connect to MongoDB with correct database name
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "r4u"
    });
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const { FileNode, Visitor } = require('./src/models');
    
    // Find OR1001 visitor
    const visitor = await Visitor.findOne({ visitorId: 'OR1001' });
    
    if (!visitor) {
      console.log('❌ OR1001 visitor not found');
      return;
    }
    
    console.log('👤 Found visitor OR1001:');
    console.log(`   Name: ${visitor.name}`);
    console.log(`   Photo URL: ${visitor.photo}`);
    
    // Find OR1001 file in file manager
    const photoFile = await FileNode.findOne({ 
      name: 'OR1001.jpg'
    });
    
    if (!photoFile) {
      console.log('❌ OR1001.jpg file not found in file manager');
      return;
    }
    
    console.log('\n📄 Found file in file manager:');
    console.log(`   Name: ${photoFile.name}`);
    console.log(`   Current URL: ${photoFile.url}`);
    
    if (photoFile.url.startsWith('/uploads/') && visitor.photo.includes('cloudinary')) {
      console.log('\n🔧 Updating file manager with Cloudinary URL...');
      
      // Update file manager entry with Cloudinary URL
      await FileNode.findByIdAndUpdate(photoFile._id, {
        url: visitor.photo
      });
      
      console.log('✅ Updated file manager entry!');
      console.log(`   New URL: ${visitor.photo}`);
      
      // Verify the update
      const updatedFile = await FileNode.findById(photoFile._id);
      console.log('\n✅ Verification:');
      console.log(`   File URL now: ${updatedFile.url}`);
      
      if (updatedFile.url.includes('cloudinary')) {
        console.log('🎉 SUCCESS! Photo should now display correctly in file manager');
      }
    } else {
      console.log('ℹ️  No update needed or visitor photo is not Cloudinary URL');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixPhotoURL();