const { Place, Employee, ActivityLog, Visitor } = require("../models");
const { asyncHandler } = require("../middleware/errorHandler");

// Get all places
exports.getAllPlaces = asyncHandler(async (req, res) => {
  try {
    const places = await Place.find({})
      .populate("assignedEmployees", "fullName emp_code emp_type")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: places,
    });
  } catch (error) {
    console.error("Get Places Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch places",
      error: error.message,
    });
  }
});

// Get place by ID
exports.getPlaceById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const place = await Place.findById(id)
      .populate("assignedEmployees", "fullName emp_code emp_type email contact");

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    res.status(200).json({
      success: true,
      data: place,
    });
  } catch (error) {
    console.error("Get Place Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch place",
      error: error.message,
    });
  }
});

// Create new place
exports.createPlace = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      assignedEmployees,
    } = req.body;

    // Check if place name already exists
    const existingPlace = await Place.findOne({ name });
    if (existingPlace) {
      return res.status(400).json({
        success: false,
        message: "Place with this name already exists",
      });
    }

    // Validate assigned employees
    if (assignedEmployees && assignedEmployees.length > 0) {
      const employees = await Employee.find({
        _id: { $in: assignedEmployees }
      });
      if (employees.length !== assignedEmployees.length) {
        return res.status(400).json({
          success: false,
          message: "Some assigned employees not found",
        });
      }
    }

    const place = await Place.create({
      name,
      description,
      location,
      assignedEmployees: assignedEmployees || [],
    });

    // Log activity
    try {
      await ActivityLog.create({
        user: req.user.id,
        userModel: 'Admin',
        action: "CREATE_PLACE",
        module: "PLACE",
        details: `Created place ${place.name} (${place.placeCode})`,
        ipAddress: req.ip,
        metadata: {
          placeId: place._id,
          placeName: place.name,
          placeCode: place.placeCode,
        },
      });
    } catch (logError) {
      console.error("Failed to log place creation:", logError);
    }

    // Populate before sending response
    await place.populate("assignedEmployees", "fullName emp_code emp_type");

    res.status(201).json({
      success: true,
      message: "Place created successfully",
      data: place,
    });
  } catch (error) {
    console.error("Create Place Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create place",
      error: error.message,
    });
  }
});

// Update place
exports.updatePlace = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    // Check if name is being changed and if it conflicts
    if (updateData.name && updateData.name !== place.name) {
      const existingPlace = await Place.findOne({ 
        name: updateData.name,
        _id: { $ne: id }
      });
      if (existingPlace) {
        return res.status(400).json({
          success: false,
          message: "Place with this name already exists",
        });
      }
    }

    // Validate assigned employees if provided
    if (updateData.assignedEmployees) {
      const employees = await Employee.find({
        _id: { $in: updateData.assignedEmployees }
      });
      if (employees.length !== updateData.assignedEmployees.length) {
        return res.status(400).json({
          success: false,
          message: "Some assigned employees not found",
        });
      }
    }

    const updatedPlace = await Place.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("assignedEmployees", "fullName emp_code emp_type");

    // Log activity
    try {
      await ActivityLog.create({
        user: req.user.id,
        userModel: 'Admin',
        action: "UPDATE_PLACE",
        module: "PLACE",
        details: `Updated place ${updatedPlace.name} (${updatedPlace.placeCode})`,
        ipAddress: req.ip,
        metadata: {
          placeId: updatedPlace._id,
          placeName: updatedPlace.name,
          placeCode: updatedPlace.placeCode,
          updatedFields: Object.keys(updateData),
        },
      });
    } catch (logError) {
      console.error("Failed to log place update:", logError);
    }

    res.status(200).json({
      success: true,
      message: "Place updated successfully",
      data: updatedPlace,
    });
  } catch (error) {
    console.error("Update Place Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update place",
      error: error.message,
    });
  }
});

// Delete place
exports.deletePlace = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    await Place.findByIdAndDelete(id);

    // Log activity
    try {
      await ActivityLog.create({
        user: req.user.id,
        userModel: 'Admin',
        action: "DELETE_PLACE",
        module: "PLACE",
        details: `Deleted place ${place.name} (${place.placeCode})`,
        ipAddress: req.ip,
        metadata: {
          placeId: place._id,
          placeName: place.name,
          placeCode: place.placeCode,
        },
      });
    } catch (logError) {
      console.error("Failed to log place deletion:", logError);
    }

    res.status(200).json({
      success: true,
      message: "Place deleted successfully",
    });
  } catch (error) {
    console.error("Delete Place Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete place",
      error: error.message,
    });
  }
});

// Assign employees to place
exports.assignEmployees = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeIds } = req.body;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    // Validate employees
    const employees = await Employee.find({
      _id: { $in: employeeIds }
    });
    if (employees.length !== employeeIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some employees not found",
      });
    }

    place.assignedEmployees = employeeIds;
    await place.save();

    // Log activity
    try {
      await ActivityLog.create({
        user: req.user.id,
        userModel: 'Admin',
        action: "ASSIGN_EMPLOYEES_TO_PLACE",
        module: "PLACE",
        details: `Assigned ${employeeIds.length} employees to place ${place.name}`,
        ipAddress: req.ip,
        metadata: {
          placeId: place._id,
          placeName: place.name,
          employeeIds: employeeIds,
          employeeCount: employeeIds.length,
        },
      });
    } catch (logError) {
      console.error("Failed to log employee assignment:", logError);
    }

    await place.populate("assignedEmployees", "fullName emp_code emp_type");

    res.status(200).json({
      success: true,
      message: "Employees assigned successfully",
      data: place,
    });
  } catch (error) {
    console.error("Assign Employees Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign employees",
      error: error.message,
    });
  }
});

// Get place visitor history
exports.getPlaceVisitorHistory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, limit = 50 } = req.query;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Get visitor activities at this place
    const activities = await ActivityLog.find({
      ...dateFilter,
      "metadata.placeId": id,
      action: { $in: ["SCAN_VISITOR", "VIEW_VISITOR"] },
    })
      .populate("user", "fullName emp_code emp_type")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Get unique visitor IDs and fetch visitor details
    const visitorIds = [...new Set(
      activities
        .map(activity => activity.metadata?.visitorId)
        .filter(Boolean)
    )];

    const visitors = await Visitor.find({
      visitorId: { $in: visitorIds }
    }).select("visitorId name companyName photo contact");

    // Create visitor lookup map
    const visitorMap = {};
    visitors.forEach(visitor => {
      visitorMap[visitor.visitorId] = visitor;
    });

    // Format activities with visitor details
    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      action: activity.details,
      type: activity.action === "SCAN_VISITOR" ? "scan" : "view",
      timestamp: activity.timestamp,
      employee: {
        name: activity.user?.fullName || "Unknown",
        code: activity.user?.emp_code,
        type: activity.user?.emp_type,
      },
      visitor: visitorMap[activity.metadata?.visitorId] || null,
      metadata: activity.metadata,
    }));

    res.status(200).json({
      success: true,
      data: {
        place: {
          id: place._id,
          name: place.name,
          placeCode: place.placeCode,
        },
        activities: formattedActivities,
        totalActivities: formattedActivities.length,
      },
    });
  } catch (error) {
    console.error("Get Place History Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch place visitor history",
      error: error.message,
    });
  }
});

// Get places assigned to current employee
exports.getMyPlaces = asyncHandler(async (req, res) => {
  try {
    const employeeId = req.user.id;

    const places = await Place.find({
      assignedEmployees: employeeId,
      status: "active",
    }).select("name placeCode location description");

    res.status(200).json({
      success: true,
      data: places,
    });
  } catch (error) {
    console.error("Get My Places Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned places",
      error: error.message,
    });
  }
});

// Get places assigned to employee
exports.getEmployeePlaces = asyncHandler(async (req, res) => {
  try {
    const { employeeId } = req.params;

    const places = await Place.find({
      assignedEmployees: employeeId,
      status: "active",
    }).select("name placeCode location description");

    res.status(200).json({
      success: true,
      data: places,
    });
  } catch (error) {
    console.error("Get Employee Places Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee places",
      error: error.message,
    });
  }
});