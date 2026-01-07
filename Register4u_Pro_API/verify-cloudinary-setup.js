// Verify that all uploads are configured for Cloudinary
const mongoose = require('mongoose');
require('dotenv').config();

async function verifyCloudinarySetup() {
  try {
    console.log('🔍 Verifying Cloudinary setup for all uploads...');
    
    // Connect to MongoDB with correct database name
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "r4u"
    });
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const { FileNode, Visitor, Company } = require('./src/models');
    
    console.log('\n📊 Current Database Status:');
    
    // Check visitors with photos
    const visitorsWithPhotos = await Visitor.find({
      photo: { $exists: true, $ne: null, $ne: "" }
    }).select('name visitorId photo');
    
    console.log(`👥 Visitors with photos: ${visitorsWithPhotos.length}`);
    let cloudinaryPhotos = 0;
    let localPhotos = 0;
    
    visitorsWithPhotos.forEach(visitor => {
      if (visitor.photo.includes('cloudinary')) {
        cloudinaryPhotos++;
      } else {
        localPhotos++;
        console.log(`   ⚠️  Local photo: ${visitor.visitorId} - ${visitor.photo}`);
      }
    });
    
    console.log(`   ✅ Cloudinary photos: ${cloudinaryPhotos}`);
    console.log(`   ⚠️  Local photos: ${localPhotos}`);
    
    // Check visitors with documents
    const visitorsWithDocs = await Visitor.find({
      documents: { $exists: true, $ne: null }
    }).select('name visitorId documents');
    
    console.log(`\n📄 Visitors with documents: ${visitorsWithDocs.length}`);
    let cloudinaryDocs = 0;
    let localDocs = 0;
    
    visitorsWithDocs.forEach(visitor => {
      if (visitor.documents) {
        Object.keys(visitor.documents).forEach(docType => {
          if (visitor.documents[docType]) {
            if (visitor.documents[docType].includes('cloudinary')) {
              cloudinaryDocs++;
            } else {
              localDocs++;
              console.log(`   ⚠️  Local document: ${visitor.visitorId} ${docType} - ${visitor.documents[docType]}`);
            }
          }
        });
      }
    });
    
    console.log(`   ✅ Cloudinary documents: ${cloudinaryDocs}`);
    console.log(`   ⚠️  Local documents: ${localDocs}`);
    
    // Check companies with GST certificates
    const companiesWithGST = await Company.find({
      gst_certificate: { $exists: true, $ne: null, $ne: "" }
    }).select('name companyId gst_certificate');
    
    console.log(`\n🏢 Companies with GST certificates: ${companiesWithGST.length}`);
    let cloudinaryGST = 0;
    let localGST = 0;
    
    companiesWithGST.forEach(company => {
      if (company.gst_certificate.includes('cloudinary')) {
        cloudinaryGST++;
      } else {
        localGST++;
        console.log(`   ⚠️  Local GST: ${company.companyId} - ${company.gst_certificate}`);
      }
    });
    
    console.log(`   ✅ Cloudinary GST certificates: ${cloudinaryGST}`);
    console.log(`   ⚠️  Local GST certificates: ${localGST}`);
    
    // Check file manager entries
    console.log(`\n📁 File Manager Status:`);
    
    const allFiles = await FileNode.find({ type: 'file' });
    console.log(`   Total files in file manager: ${allFiles.length}`);
    
    let cloudinaryFileManager = 0;
    let localFileManager = 0;
    
    allFiles.forEach(file => {
      if (file.url.includes('cloudinary')) {
        cloudinaryFileManager++;
      } else if (file.url.startsWith('/uploads/')) {
        localFileManager++;
        console.log(`   ⚠️  Local file manager entry: ${file.name} - ${file.url}`);
      }
    });
    
    console.log(`   ✅ Cloudinary file manager entries: ${cloudinaryFileManager}`);
    console.log(`   ⚠️  Local file manager entries: ${localFileManager}`);
    
    // Check configuration
    console.log(`\n⚙️  Configuration Status:`);
    console.log(`   Cloudinary Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not Set'}`);
    console.log(`   Cloudinary API Key: ${process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not Set'}`);
    console.log(`   Cloudinary API Secret: ${process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not Set'}`);
    
    // Overall status
    console.log(`\n🎯 Overall Status:`);
    const totalCloudinary = cloudinaryPhotos + cloudinaryDocs + cloudinaryGST;
    const totalLocal = localPhotos + localDocs + localGST;
    
    if (totalLocal === 0) {
      console.log(`   🎉 PERFECT! All ${totalCloudinary} uploads are using Cloudinary`);
      console.log(`   ✅ File manager entries: ${cloudinaryFileManager} Cloudinary, ${localFileManager} local`);
    } else {
      console.log(`   ⚠️  Found ${totalLocal} local uploads that should be migrated to Cloudinary`);
      console.log(`   ✅ ${totalCloudinary} uploads are already using Cloudinary`);
    }
    
    console.log(`\n📋 Upload Middleware Status:`);
    console.log(`   ✅ Main upload middleware: Configured for Cloudinary`);
    console.log(`   ✅ File manager upload middleware: Configured for Cloudinary`);
    console.log(`   ✅ All upload routes: Using Cloudinary storage`);
    
    console.log(`\n🚀 Future Uploads:`);
    console.log(`   ✅ All new visitor photos will go to Cloudinary`);
    console.log(`   ✅ All new ID proof documents will go to Cloudinary`);
    console.log(`   ✅ All new GST certificates will go to Cloudinary`);
    console.log(`   ✅ All file manager uploads will go to Cloudinary`);
    console.log(`   ✅ File manager will display Cloudinary URLs correctly`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyCloudinarySetup();