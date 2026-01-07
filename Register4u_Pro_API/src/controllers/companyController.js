const { Company } = require("../models");

// Get all companies
exports.getAllCompanies = async (req, res) => {
  try {
    console.log("📋 Fetching all companies...");

    const companies = await Company.find().sort({ createdAt: -1 });

    console.log(`✅ Found ${companies.length} companies`);

    res.status(200).json({
      message: "Get All Companies",
      success: true,
      data: companies.map((comp) => ({ ...comp.toObject(), id: comp._id })),
    });
  } catch (error) {
    console.error("❌ Company Error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

// Get company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Get Company",
      success: true,
      data: { ...company.toObject(), id: company._id },
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Helper to generate CMP ID
const generateCompanyId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000 to 9999
  return `CMP${randomNum}`;
};

// Create company
exports.createCompany = async (req, res) => {
  try {
    console.log("📝 Creating company:", req.body);

    // Generate unique Company ID
    let companyId = generateCompanyId();
    let exists = await Company.findOne({ companyId });
    while (exists) {
      companyId = generateCompanyId();
      exists = await Company.findOne({ companyId });
    }

    const companyData = {
      name: req.body.name,
      companyId, // Add generated ID
      address: req.body.address || "N/A",
      state: req.body.state || "N/A",
      city: req.body.city || "N/A",
      pincode: req.body.pincode || 0,
      GSIJN: req.body.GSIJN || req.body.gstin || req.body.gsijn || "N/A",
      // CIN removed
      category: req.body.category || "General",
      gst_certificate: req.file ? req.file.path : null, // Handle uploaded file
      contact: req.body.contact,
      email: req.body.email,
      website: req.body.website, // Add website
      logo: req.body.logo,
    };

    // Handle GST certificate file upload and sync to file manager
    if (req.file) {
      const { FileNode } = require("../models");
      const path = require("path");

      try {
        // Find or create gst_certificate folder
        let folder = await FileNode.findOne({
          name: "gst_certificate",
          type: "folder",
          parentId: null, // Root level
        });

        if (!folder) {
          folder = await FileNode.create({
            name: "gst_certificate",
            type: "folder",
            parentId: null,
          });
          console.log("📁 Created gst_certificate folder");
        }

        // Get file extension
        const ext = path.extname(req.file.originalname);
        const finalFileName = `GST_${companyId}${ext}`;
        
        // Check if file is on Cloudinary, use that URL and add to file manager
        if (req.file.path && (req.file.path.includes('cloudinary') || req.file.path.startsWith('http'))) {
          // Use Cloudinary URL directly
          companyData.gst_certificate = req.file.path;
          
          // Add to file manager with Cloudinary URL
          const existingNode = await FileNode.findOne({
            name: finalFileName,
            parentId: folder._id,
          });

          if (!existingNode) {
            await FileNode.create({
              name: finalFileName,
              type: "file",
              parentId: folder._id,
              url: req.file.path, // Use Cloudinary URL
              size: req.file.size || 0,
              mimeType: req.file.mimetype || "application/pdf",
            });
            console.log(`📁 Added GST certificate to file manager with Cloudinary URL: ${finalFileName}`);
          }
        } else {
          // Local file handling (fallback)
          const fs = require("fs");
          const uploadsDir = path.join(__dirname, "../../uploads");
          const newFilePath = path.join(uploadsDir, finalFileName);
          
          // Copy/rename the uploaded file
          if (fs.existsSync(req.file.path)) {
            fs.copyFileSync(req.file.path, newFilePath);
            console.log(`📁 GST certificate copied to: ${finalFileName}`);
          }

          // Check if file node already exists in file manager
          const existingNode = await FileNode.findOne({
            name: finalFileName,
            parentId: folder._id,
          });

          if (!existingNode) {
            // Create file node in file manager
            await FileNode.create({
              name: finalFileName,
              type: "file",
              parentId: folder._id,
              url: `/uploads/${finalFileName}`,
              size: req.file.size || 0,
              mimeType: req.file.mimetype || "application/pdf",
            });
            console.log(`📁 Added GST certificate to file manager: ${finalFileName}`);
          }

          // Update company data with new file path
          companyData.gst_certificate = `/uploads/${finalFileName}`;
        }
      } catch (error) {
        console.error("Error syncing GST certificate to file manager:", error);
        // Keep original file path if sync fails
        companyData.gst_certificate = req.file.path;
      }
    }

    const company = await Company.create(companyData);

    console.log("✅ Company created:", company._id);

    res.status(201).json({
      message: "Company created successfully",
      success: true,
      data: { ...company.toObject(), id: company._id },
    });
  } catch (error) {
    console.error("❌ Create Company Error:", error);
    console.error("Error details:", error.message);
    res.status(500).json({
      message: error.message, // Expose error for debugging
      success: false,
      error: error.message,
    });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
  try {
    // Get the company first to access companyId
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Handle GST certificate file upload and sync to file manager
    if (req.file) {
      const { FileNode } = require("../models");
      const path = require("path");

      try {
        // Find or create gst_certificate folder
        let folder = await FileNode.findOne({
          name: "gst_certificate",
          type: "folder",
          parentId: null, // Root level
        });

        if (!folder) {
          folder = await FileNode.create({
            name: "gst_certificate",
            type: "folder",
            parentId: null,
          });
          console.log("📁 Created gst_certificate folder");
        }

        // Get file extension
        const ext = path.extname(req.file.originalname);
        const finalFileName = `GST_${company.companyId}${ext}`;
        
        // Check if file is on Cloudinary, use that URL and add to file manager
        if (req.file.path && (req.file.path.includes('cloudinary') || req.file.path.startsWith('http'))) {
          // Use Cloudinary URL directly
          updateData.gst_certificate = req.file.path;
          
          // Add to file manager with Cloudinary URL
          const existingNode = await FileNode.findOne({
            name: finalFileName,
            parentId: folder._id,
          });

          if (!existingNode) {
            await FileNode.create({
              name: finalFileName,
              type: "file",
              parentId: folder._id,
              url: req.file.path, // Use Cloudinary URL
              size: req.file.size || 0,
              mimeType: req.file.mimetype || "application/pdf",
            });
            console.log(`📁 Added GST certificate to file manager with Cloudinary URL: ${finalFileName}`);
          }
        } else {
          // Local file handling (fallback)
          const fs = require("fs");
          const uploadsDir = path.join(__dirname, "../../uploads");
          const newFilePath = path.join(uploadsDir, finalFileName);
          
          // Copy/rename the uploaded file
          if (fs.existsSync(req.file.path)) {
            fs.copyFileSync(req.file.path, newFilePath);
            console.log(`📁 GST certificate copied to: ${finalFileName}`);
          }

          // Check if file node already exists in file manager
          const existingNode = await FileNode.findOne({
            name: finalFileName,
            parentId: folder._id,
          });

          if (!existingNode) {
            // Create file node in file manager
            await FileNode.create({
              name: finalFileName,
              type: "file",
              parentId: folder._id,
              url: `/uploads/${finalFileName}`,
              size: req.file.size || 0,
              mimeType: req.file.mimetype || "application/pdf",
            });
            console.log(`📁 Added GST certificate to file manager: ${finalFileName}`);
          }

          // Update company data with new file path
          updateData.gst_certificate = `/uploads/${finalFileName}`;
        }
      } catch (error) {
        console.error("Error syncing GST certificate to file manager:", error);
        // Keep original file path if sync fails
        updateData.gst_certificate = req.file.path;
      }
    }
    
    // Handle GSTIN with multiple casing options
    if (req.body.GSIJN || req.body.gstin || req.body.gsijn) {
      updateData.GSIJN = req.body.GSIJN || req.body.gstin || req.body.gsijn;
    }

    // Handle category
    if (req.body.category) updateData.category = req.body.category;

    // Handle website
    if (req.body.website) updateData.website = req.body.website;

    console.log("📝 Update Payload:", updateData); // Debug log

    const updatedCompany = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.status(200).json({
      message: "Company updated successfully",
      success: true,
      data: { ...updatedCompany.toObject(), id: updatedCompany._id },
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    console.log(`🗑️ Deleting company: ${company.companyId} (${company.name})`);

    // Clean up file manager entries for this company
    try {
      const { FileNode } = require("../models");
      
      // Delete GST certificate from file manager
      if (company.companyId) {
        console.log(`🔍 Looking for GST certificate files for company: ${company.companyId}`);
        
        // Find gst_certificate folder
        const folder = await FileNode.findOne({
          name: "gst_certificate",
          type: "folder",
          parentId: null,
        });

        if (folder) {
          console.log(`📁 GST certificate folder found: ${folder._id}`);
          
          // Find and delete GST certificate file
          const fileNode = await FileNode.findOne({
            name: { $regex: new RegExp(`GST_${company.companyId}`, 'i') },
            parentId: folder._id,
            type: "file"
          });

          if (fileNode) {
            await FileNode.findByIdAndDelete(fileNode._id);
            console.log(`🗑️ Deleted GST certificate from file manager: ${fileNode.name}`);
          } else {
            console.log(`ℹ️ No GST certificate file found for company ${company.companyId} in file manager`);
          }
        } else {
          console.log(`⚠️ GST certificate folder not found in file manager`);
        }
      }

      console.log(`🧹 File manager cleanup completed for company: ${company.companyId}`);
    } catch (error) {
      console.error("Error during file manager cleanup:", error);
      // Continue with company deletion even if file cleanup fails
    }

    await Company.findByIdAndDelete(req.params.id);

    console.log(`✅ Company deleted successfully: ${company.companyId}`);

    res.status(200).json({
      message: "Company deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
