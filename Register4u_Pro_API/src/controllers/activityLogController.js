const { ActivityLog } = require("../models");
const { asyncHandler } = require("../middleware/errorHandler");

// Get all logs with pagination
exports.getLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20; // Default 20
  const startIndex = (page - 1) * limit;

  // Build query
  const query = {};
  if (req.query.module) {
    query.module = req.query.module;
  }
  if (req.query.action) {
    query.action = { $regex: req.query.action, $options: "i" };
  }
  if (req.query.search) {
    // Search in details or action
    query.$or = [
      { details: { $regex: req.query.search, $options: "i" } },
      { action: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const total = await ActivityLog.countDocuments(query);
  const logs = await ActivityLog.find(query)
    .populate({
      path: 'user',
      select: 'username email role fullName emp_code emp_type name',
      // This will automatically use the correct model based on userModel field
    })
    .sort({ timestamp: -1 })
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: logs.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
    data: logs,
  });
});

// Create log manually
exports.createLog = asyncHandler(async (req, res) => {
  const { action, module, details, metadata } = req.body;

  const userName = req.user ? req.user.name || req.user.fullName : "System";
  const log = await ActivityLog.create({
    user: req.user.id,
    userModel: req.user ? 'Employee' : 'Admin', // Specify user type
    action,
    module,
    details: `${details} by ${userName}`,
    metadata: {
      ...metadata,
      createdBy: userName,
    },
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    data: log,
  });
});
