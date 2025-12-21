const { Category } = require('../models');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    console.log('📋 Fetching all categories...');
    
    const categories = await Category.find();
    
    // Map 'category' field to 'name' for frontend compatibility
    const transformedCategories = categories.map(cat => ({
      id: cat._id,
      name: cat.category,
      category: cat.category,
      description: cat.description,
      price: cat.price
    }));
    
    console.log(`✅ Found ${categories.length} categories`);
    
    res.status(200).json({
      message: 'Get All Categories',
      success: true,
      data: transformedCategories
    });
  } catch (error) {
    console.error('❌ Category Error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: 'Internal Server Error', 
      success: false,
      error: error.message 
    });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
        success: false
      });
    }
    
    res.status(200).json({
      message: 'Get Category',
      success: true,
      data: { ...category.toObject(), id: category._id, name: category.category }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    console.log('📝 Creating category:', req.body);
    
    // Map frontend 'name' field to database 'category' field
    const categoryData = {
      category: req.body.name || req.body.category,
      description: req.body.description,
      price: req.body.price
    };
    
    const category = await Category.create(categoryData);
    
    console.log('✅ Category created:', category._id);
    
    res.status(201).json({
      message: 'Category created successfully',
      success: true,
      data: { ...category.toObject(), id: category._id, name: category.category }
    });
  } catch (error) {
    console.error('❌ Create Category Error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Internal Server Error', 
      success: false,
      error: error.message 
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
        success: false
      });
    }
    
    res.status(200).json({
      message: 'Category updated successfully',
      success: true,
      data: { ...category.toObject(), id: category._id, name: category.category }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Category deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};
