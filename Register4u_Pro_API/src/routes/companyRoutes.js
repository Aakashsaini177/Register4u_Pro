const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const companyController = require("../controllers/companyController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validation");

// Get all companies
router.get("/", authenticate, companyController.getAllCompanies);

// Get company by ID
router.get("/:id", authenticate, companyController.getCompanyById);

// Create company
router.post(
  "/",
  [
    authenticate,
    body("name").notEmpty().withMessage("Name is required"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    validate,
  ],
  companyController.createCompany
);

// Update company
router.put("/:id", authenticate, companyController.updateCompany);

// Delete company
router.delete("/:id", authenticate, companyController.deleteCompany);

module.exports = router;
