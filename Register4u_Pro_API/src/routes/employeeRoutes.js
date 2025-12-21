const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const employeeController = require("../controllers/employeeController");
const { authenticate, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validation");

// Get all employees (with pagination and login info)
router.post("/", authenticate, adminOnly, employeeController.getAllEmployees);

// Get employee by ID
router.get("/:id", authenticate, adminOnly, employeeController.getEmployeeById);

// Create employee
router.post(
  "/create",
  [
    authenticate,
    adminOnly,
    body("name").optional(), // Name is virtual, fullName is actual field
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").optional(),
    validate,
  ],
  employeeController.createEmployee
);

// Update employee
router.put("/:id", authenticate, adminOnly, employeeController.updateEmployee);

// Delete employee
router.delete(
  "/:id",
  authenticate,
  adminOnly,
  employeeController.deleteEmployee
);

// Login management endpoints (Admin only)
router.post(
  "/:id/toggle-login",
  authenticate,
  adminOnly,
  employeeController.toggleEmployeeLogin
);
router.post(
  "/:id/reset-password",
  authenticate,
  adminOnly,
  employeeController.resetEmployeePassword
);
router.get(
  "/:id/login-history",
  authenticate,
  adminOnly,
  employeeController.getEmployeeLoginHistory
);

module.exports = router;
