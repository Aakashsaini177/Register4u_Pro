// Test script to verify photo upload fixes
const axios = require('axios');

const API_BASE = 'http://localhost:4002/api/v1';

async function testPhotoFix() {
  try {
    console.log('🧪 Testing photo upload fixes...');
    
    // 1. Test getting all visitors to see current photo URLs
    const response = await axios.post(`${API_BASE}/getallvisitors`, {
      search: ""
    });
    
    if (response.data.success) {
      const visitors = response.data.data;
      console.log(`📋 Found ${visitors.length} visitors`);
      
      // Check photo URLs
      const visitorsWithPhotos = visitors.filter(v => v.photo);
      console.log(`📸 Visitors with photos: ${visitorsWithPhotos.length}`);
      
      visitorsWithPhotos.slice(0, 5).forEach(visitor => {
        console.log(`👤 ${visitor.name} (${visitor.visitorId}): ${visitor.photo}`);
        
        // Check if photo URL is local path (problematic) or Cloudinary URL (good)
        if (visitor.photo.startsWith('/uploads/')) {
          console.log(`⚠️  Local path detected: ${visitor.photo}`);
        } else if (visitor.photo.includes('cloudinary')) {
          console.log(`✅ Cloudinary URL detected: ${visitor.photo}`);
        } else {
          console.log(`❓ Unknown URL format: ${visitor.photo}`);
        }
      });
    }
    
    // 2. Test file manager to see photo folder contents
    const fileManagerResponse = await axios.get(`${API_BASE}/files/list`);
    if (fileManagerResponse.data.success) {
      const folders = fileManagerResponse.data.data;
      const photoFolder = folders.find(f => f.name === 'photo' && f.type === 'folder');
      
      if (photoFolder) {
        console.log(`📁 Found photo folder: ${photoFolder._id}`);
        
        // Get photo folder contents
        const photoContentsResponse = await axios.get(`${API_BASE}/files/list?parentId=${photoFolder._id}`);
        if (photoContentsResponse.data.success) {
          const photoFiles = photoContentsResponse.data.data;
          console.log(`📸 Photo folder contains ${photoFiles.length} files`);
          
          photoFiles.slice(0, 5).forEach(file => {
            console.log(`📄 ${file.name}: ${file.url}`);
            
            // Check if file URL is local path (problematic) or Cloudinary URL (good)
            if (file.url.startsWith('/uploads/')) {
              console.log(`⚠️  Local path in file manager: ${file.url}`);
            } else if (file.url.includes('cloudinary')) {
              console.log(`✅ Cloudinary URL in file manager: ${file.url}`);
            } else {
              console.log(`❓ Unknown URL format in file manager: ${file.url}`);
            }
          });
        }
      } else {
        console.log('❌ Photo folder not found');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPhotoFix();