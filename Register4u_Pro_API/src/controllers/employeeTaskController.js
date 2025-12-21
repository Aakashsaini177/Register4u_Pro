const { EmployeeTask } = require('../models');

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    console.log('📋 Fetching all tasks...');
    
    const tasks = await EmployeeTask.find().sort({ createdAt: -1 }).populate('assignedTo');
    
    console.log(`✅ Found ${tasks.length} tasks`);
    
    res.status(200).json({
      message: 'Get All Tasks',
      success: true,
      data: tasks.map(task => ({ ...task.toObject(), id: task._id }))
    });
  } catch (error) {
    console.error('❌ Task Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await EmployeeTask.findById(req.params.id).populate('assignedTo');
    
    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        success: false
      });
    }
    
    res.status(200).json({
      message: 'Get Task',
      success: true,
      data: { ...task.toObject(), id: task._id }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

// Create task
exports.createTask = async (req, res) => {
  try {
    console.log('📝 Creating task:', req.body);
    
    const task = await EmployeeTask.create(req.body);
    
    console.log('✅ Task created:', task._id);
    
    res.status(201).json({
      message: 'Task created successfully',
      success: true,
      data: { ...task.toObject(), id: task._id }
    });
  } catch (error) {
    console.error('❌ Create Task Error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Internal Server Error', 
      success: false,
      error: error.message 
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await EmployeeTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        success: false
      });
    }
    
    res.status(200).json({
      message: 'Task updated successfully',
      success: true,
      data: { ...task.toObject(), id: task._id }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    await EmployeeTask.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Task deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};
