const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

// Import controllers
const authController = require("../controllers/authController");
const employeeController = require("../controllers/employeeController");
const companyController = require("../controllers/companyController");
const eventController = require("../controllers/eventController");
// ==================== EVENT ROUTES ====================
router.get("/event/:id", eventController.getEventById);
router.post("/createevent", eventController.createEvent);
router.post("/updateevent/:id", eventController.updateEvent);
router.post("/deleteevent/:id", eventController.deleteEvent);
router.post("/getallevent", eventController.getAllEvents);

// ==================== VISITOR ROUTES ====================
// Import Route (Must be before other visitor routes to avoid conflicts)
const visitorController = require("../controllers/visitorController");
const categoryController = require("../controllers/categoryController");
const dashboardController = require("../controllers/dashboardController");
const barcodeController = require("../controllers/barcodeController");
const importController = require("../controllers/importController");
// Import middleware
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");
const importUpload = require("../middleware/importUpload");
const validate = require("../middleware/validation");

// Import new module routes
const hotelRoutes = require("./hotelRoutes");
const travelRoutes = require("./travelRoutes");
const driverRoutes = require("./driverRoutes");
const portalRoutes = require("./portalRoutes");
const sysSettingsRoutes = require("./sysSettingsRoutes");
const activityLogRoutes = require("./activityLog");
const inviteRoutes = require("./inviteRoutes");
const fileManagerRoutes = require("./fileManagerRoutes");
const authRoutes = require("./auth"); // Employee authentication routes
const employeeRoutes = require("./employeeRoutes"); // Employee management routes
const requirementRoutes = require("./requirementRoutes");

// ==================== AUTH ROUTES ====================
// Get current user
router.get("/me", authenticate, authController.getCurrentUser);
// Update preferences
router.put("/preferences", authenticate, authController.updatePreferences);
// Log recent scan
router.post("/recent-scans", authenticate, authController.logRecentScan);

router.post(
  "/login",
  [
    body("username").isLength({ min: 5 }),
    body("password").isLength({ min: 5 }),
  ],
  authController.login
);
router.post("/forgotpasssword", authController.forgotPassword);
router.post("/resetpassword", authController.resetPassword);

// ==================== EMPLOYEE ROUTES ====================
router.get("/employee/:id", employeeController.getEmployeeById);
router.post("/createemployee", employeeController.createEmployee);
router.post("/updateemployee/:id", employeeController.updateEmployee);
router.post("/deleteemployee/:id", employeeController.deleteEmployee);
router.post("/getAllEmployee", employeeController.getAllEmployees);

// ==================== COMPANY ROUTES ====================
router.get("/company/:id", authenticate, companyController.getCompanyById);
router.post("/createcompany", [
  authenticate,
  upload.single("gst_certificate"),
  body("name").notEmpty().withMessage("Name is required"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  validate
], companyController.createCompany);
router.post("/companyupdate/:id", [
  authenticate,
  upload.single("gst_certificate")
], companyController.updateCompany);
router.post("/deletecompany/:id", authenticate, companyController.deleteCompany);
router.get("/getallcompany", authenticate, companyController.getAllCompanies);

// ==================== EVENT ROUTES ====================
router.get("/event/:id", eventController.getEventById);
router.post("/createevent", eventController.createEvent);
router.post("/updateevent/:id", eventController.updateEvent);
router.post("/deleteevent/:id", eventController.deleteEvent);
router.post("/getallevent", eventController.getAllEvents);

// ==================== VISITOR ROUTES ====================
// Import Route (Must be before other visitor routes to avoid conflicts)
router.post(
  "/visitors/import",
  importUpload.single("file"), // Expects form-data with key 'file'
  importController.importVisitors
);

router.post(
  "/visitors/create-public",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panFront", maxCount: 1 },
    { name: "panBack", maxCount: 1 },
  ]),
  visitorController.createPublicVisitor
);

// Scan & Dashboard Routes (Must be before /visitors/:visitorId)
router.post("/visitors/scan", authenticate, visitorController.scanVisitor);
router.get(
  "/visitors/dashboard/stats",
  authenticate,
  visitorController.getEmployeeDashboardStats
);

router.get(
  "/visitors/:visitorId",
  authenticate,
  visitorController.getVisitorById
);
router.post(
  "/createvisitors",
  authenticate,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panFront", maxCount: 1 },
    { name: "panBack", maxCount: 1 },
  ]),
  visitorController.createVisitor
);
router.post(
  "/updatevisitors/:visitorId",
  authenticate,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panFront", maxCount: 1 },
    { name: "panBack", maxCount: 1 },
  ]),
  visitorController.updateVisitor
);
router.post("/exportVisitors", authenticate, visitorController.exportVisitors);
router.post(
  "/deleteVisitors",
  authenticate,
  visitorController.deleteMultipleVisitors
);
router.post(
  "/deletevisitors/:visitorId",
  authenticate,
  visitorController.deleteVisitor
);
router.post("/getAllVisitors", authenticate, visitorController.getAllVisitors);
router.post(
  "/visitors/:visitorId/check-in",
  authenticate,
  visitorController.markCheckIn
);

// ==================== CATEGORY ROUTES ====================
router.post("/createCategory", authenticate, categoryController.createCategory);
router.get(
  "/getallCategory",
  authenticate,
  categoryController.getAllCategories
);

// ==================== BARCODE/VISITOR CARD ROUTES ====================
router.get("/barcode/:visitorId", barcodeController.generateBarcode);
router.get("/visitorcard/:visitorId", barcodeController.getVisitorCard);

// ==================== DASHBOARD ROUTES ====================
router.get("/dashboard", dashboardController.getDashboard);

// ==================== NEW MODULE ROUTES ====================
router.use("/auth", authRoutes); // Employee authentication routes
router.use("/employees", employeeRoutes); // Employee management routes
router.use("/hotels", hotelRoutes);
router.use("/travel", travelRoutes);
router.use("/drivers", driverRoutes);
router.use("/portal", portalRoutes);
router.use("/settings", sysSettingsRoutes);
router.use("/activity-logs", activityLogRoutes);
router.use("/invites", inviteRoutes);
router.use("/requirements", requirementRoutes);
const reportRoutes = require("./reportRoutes");
router.use("/events", reportRoutes);

// API documentation
router.use("/files", fileManagerRoutes);

router.get("/docs", (req, res) => {
  res.json({
    success: true,
    message: "Register4u Pro API Documentation",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/v1/auth/login": "Login",
        "GET /api/v1/auth/me": "Get current user",
        "PUT /api/v1/auth/change-password": "Change password",
        "POST /api/v1/auth/forgot-password": "Forgot password",
        "POST /api/v1/auth/reset-password": "Reset password",
      },
      employees: {
        "POST /api/v1/employees":
          "Get all employees (with pagination & search)",
        "GET /api/v1/employees/:id": "Get employee by ID",
        "POST /api/v1/employees/create": "Create employee",
        "PUT /api/v1/employees/:id": "Update employee",
        "DELETE /api/v1/employees/:id": "Delete employee",
      },
      companies: {
        "GET /api/v1/companies": "Get all companies",
        "GET /api/v1/companies/:id": "Get company by ID",
        "POST /api/v1/companies": "Create company",
        "PUT /api/v1/companies/:id": "Update company",
        "DELETE /api/v1/companies/:id": "Delete company",
      },
      events: {
        "POST /api/v1/events": "Get all events",
        "GET /api/v1/events/:id": "Get event by ID",
        "POST /api/v1/events/create": "Create event",
        "PUT /api/v1/events/:id": "Update event",
        "DELETE /api/v1/events/:id": "Delete event",
      },
      visitors: {
        "POST /api/v1/visitors": "Get all visitors (with pagination & search)",
        "GET /api/v1/visitors/:id": "Get visitor by ID",
        "POST /api/v1/visitors/create": "Create visitor (with photo upload)",
        "PUT /api/v1/visitors/:id": "Update visitor",
        "DELETE /api/v1/visitors/:id": "Delete visitor",
        "POST /api/v1/visitors/:id/check-in": "Check-in visitor",
        "POST /api/v1/visitors/:id/check-out": "Check-out visitor",
      },

      categories: {
        "GET /api/v1/categories": "Get all categories",
        "GET /api/v1/categories/:id": "Get category by ID",
        "POST /api/v1/categories": "Create category",
        "PUT /api/v1/categories/:id": "Update category",
        "DELETE /api/v1/categories/:id": "Delete category",
      },
      dashboard: {
        "GET /api/v1/dashboard": "Get dashboard statistics",
      },
    },
  });
});

module.exports = router;
