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
    // Prepare update data
    const updateData = { ...req.body };
    if (req.file) {
      updateData.gst_certificate = req.file.path;
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

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Company updated successfully",
      success: true,
      data: { ...company.toObject(), id: company._id },
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Company deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
