const AccommodationRequirement = require("../models/AccommodationRequirement");
const Visitor = require("../models/Visitor");
const Event = require("../models/Event");

// Create new requirement
const createRequirement = async (req, res) => {
  try {
    const {
      visitorId,
      eventId,
      roomCategory,
      checkInDate,
      checkOutDate,
      priority,
      remarks,
    } = req.body;

    // Validate required fields
    if (
      !visitorId ||
      !eventId ||
      !roomCategory ||
      !checkInDate ||
      !checkOutDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const requirement = await AccommodationRequirement.create({
      visitorId,
      eventId,
      roomCategory,
      checkInDate,
      checkOutDate,
      priority: priority || "Normal",
      remarks,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Accommodation requirement created successfully",
      data: requirement,
    });
  } catch (error) {
    console.error("Error creating requirement:", error);
    res.status(500).json({
      success: false,
      message: "Error creating requirement",
      error: error.message,
    });
  }
};

// Get all requirements (with filters)
const getRequirements = async (req, res) => {
  try {
    const { eventId, status } = req.query;

    const query = {};
    if (eventId) query.eventId = eventId;
    if (status) query.status = status;

    const requirements = await AccommodationRequirement.find(query).sort({
      createdAt: -1,
    });

    // Enhance definition with visitor name lookup if possible (lightweight)
    // Or let frontend handle it via visitor ID
    // For now, return as is.

    res.json({
      success: true,
      count: requirements.length,
      data: requirements,
    });
  } catch (error) {
    console.error("Error fetching requirements:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching requirements",
      error: error.message,
    });
  }
};

// Update requirement status
const updateRequirementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const requirement = await AccommodationRequirement.findById(id);
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    if (status) requirement.status = status;
    if (remarks) requirement.remarks = remarks;

    await requirement.save();

    res.json({
      success: true,
      message: "Requirement updated successfully",
      data: requirement,
    });
  } catch (error) {
    console.error("Error updating requirement:", error);
    res.status(500).json({
      success: false,
      message: "Error updating requirement",
      error: error.message,
    });
  }
};

// Delete requirement
const deleteRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    await AccommodationRequirement.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "Requirement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting requirement",
      error: error.message,
    });
  }
};

module.exports = {
  createRequirement,
  getRequirements,
  updateRequirementStatus,
  deleteRequirement,
};
