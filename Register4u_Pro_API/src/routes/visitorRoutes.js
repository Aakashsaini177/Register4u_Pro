const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const visitorController = require("../controllers/visitorController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validation");
const upload = require("../middleware/upload");
const importController = require("../controllers/importController");

// Import Route (Must be before :id routes to avoid conflict)
router.post(
  "/import",
  upload.single("file"), // Expects form-data with key 'file'
  importController.importVisitors
);

// Public Registration Route
router.post(
  "/create-public",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panFront", maxCount: 1 },
    { name: "panBack", maxCount: 1 },
  ]),
  visitorController.createPublicVisitor
);

// Scan visitor
router.post("/scan", authenticate, visitorController.scanVisitor);

// Employee Dashboard Stats
router.get(
  "/dashboard/stats",
  authenticate,
  visitorController.getEmployeeDashboardStats
);

// Get all visitors (with pagination)
router.post("/", authenticate, visitorController.getAllVisitors);

// Get visitor by ID
router.get("/:id", authenticate, visitorController.getVisitorById);

// Create visitor (with photo upload)
router.post(
  "/create",
  [
    authenticate,
    upload.single("photo"),
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    validate,
  ],
  visitorController.createVisitor
);

// Update visitor
router.put(
  "/:id",
  [authenticate, upload.single("photo")],
  visitorController.updateVisitor
);

// Delete visitor
router.delete("/:id", authenticate, visitorController.deleteVisitor);

// Check-in visitor
router.post(
  "/:visitorId/check-in",
  authenticate,
  visitorController.markCheckIn
);

// Check-out visitor
router.post("/:id/check-out", authenticate, visitorController.checkOut);

module.exports = router;
