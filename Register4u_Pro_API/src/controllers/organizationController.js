const { Organization } = require('../models');

// Get all organizations
exports.getAllOrganizations = async (req, res) => {
  try {
    console.log('📋 Fetching all organizations...');
    
    const organizations = await Organization.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${organizations.length} organizations`);
    
    res.status(200).json({
      message: 'Get All Organizations',
      success: true,
      data: organizations.map(org => ({ ...org.toObject(), id: org._id }))
    });
  } catch (error) {
    console.error('❌ Organization Error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: 'Internal Server Error', 
      success: false,
      error: error.message 
    });
  }
};

// Get organization by ID
exports.getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        message: 'Organization not found',
        success: false
      });
    }
    
    res.status(200).json({
      message: 'Get Organization',
      success: true,
      data: { ...organization.toObject(), id: organization._id }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

// Create organization
exports.createOrganization = async (req, res) => {
  try {
    console.log('📝 Creating organization:', req.body);
    
    const organizationData = {
      name: req.body.name,
      address: req.body.address || 'N/A',
      state: req.body.state || 'N/A',
      city: req.body.city || 'N/A',
      pincode: req.body.pincode || 0,
      GSIJN: req.body.GSIJN || req.body.gstin || 'N/A',
      CIN: req.body.CIN || req.body.cin || 'N/A',
      org_type: req.body.org_type || req.body.type || 'General',
      contact: req.body.contact,
      email: req.body.email,
      logo: req.body.logo
    };
    
    const organization = await Organization.create(organizationData);
    
    console.log('✅ Organization created:', organization._id);
    
    res.status(201).json({
      message: 'Organization created successfully',
      success: true,
      data: { ...organization.toObject(), id: organization._id }
    });
  } catch (error) {
    console.error('❌ Create Organization Error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Internal Server Error', 
      success: false,
      error: error.message 
    });
  }
};

// Update organization
exports.updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!organization) {
      return res.status(404).json({
        message: 'Organization not found',
        success: false
      });
    }
    
    res.status(200).json({
      message: 'Organization updated successfully',
      success: true,
      data: { ...organization.toObject(), id: organization._id }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

// Delete organization
exports.deleteOrganization = async (req, res) => {
  try {
    await Organization.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Organization deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};
