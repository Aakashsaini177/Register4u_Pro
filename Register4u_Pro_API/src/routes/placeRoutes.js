const express = require("express");
const router = express.Router();
const placeController = require("../controllers/placeController");
const { authenticate } = require("../middleware/auth");
const { requireAdmin, requireEmployee } = require("../middleware/roleAuth");

// Employee routes (can access their assigned places)
router.get("/my-places", authenticate, requireEmployee, placeController.getMyPlaces);

// Admin-only routes
router.use(authenticate);
router.use(requireAdmin);

// Get all places
router.get("/", placeController.getAllPlaces);

// Get place by ID
router.get("/:id", placeController.getPlaceById);

// Create new place
router.post("/", placeController.createPlace);

// Update place
router.put("/:id", placeController.updatePlace);

// Delete place
router.delete("/:id", placeController.deletePlace);

// Assign employees to place
router.post("/:id/assign-employees", placeController.assignEmployees);

// Get place visitor history
router.get("/:id/history", placeController.getPlaceVisitorHistory);

// Get places assigned to employee (for dropdown/selection)
router.get("/employee/:employeeId", placeController.getEmployeePlaces);

module.exports = router;