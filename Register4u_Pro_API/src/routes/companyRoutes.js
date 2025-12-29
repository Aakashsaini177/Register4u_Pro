const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const companyController = require("../controllers/companyController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validation");

const upload = require("../middleware/upload");

// Get all companies
router.get("/", authenticate, companyController.getAllCompanies);

// Get company by ID
router.get("/:id", authenticate, companyController.getCompanyById);

// Create company
router.post(
  "/",
  [
    (req, res, next) => {
      console.log("🔍 Incoming Request Headers:", req.headers["content-type"]);
      next();
    },
    authenticate, // Single authentication
    (req, res, next) => {
      upload.single("gst_certificate")(req, res, (err) => {
        if (err) {
          console.error("❌ File Upload Error:", err);
          return res.status(400).json({
            success: false,
            message: "File upload failed: " + err.message,
          });
        }
        console.log("📝 Body after upload:", req.body); // Debug log
        console.log("📂 File after upload:", req.file); // Debug log
        next();
      });
    },
    body("name").notEmpty().withMessage("Name is required"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    validate,
  ],
  companyController.createCompany
);

// Update company
router.put(
  "/:id",
  [
    authenticate,
    (req, res, next) => {
      upload.single("gst_certificate")(req, res, (err) => {
        if (err) {
          console.error("❌ File Upload Error (Update):", err);
          return res.status(400).json({
            success: false,
            message: "File upload failed: " + err.message,
          });
        }
        next();
      });
    },
  ],
  companyController.updateCompany
);

// Delete company
router.delete("/:id", authenticate, companyController.deleteCompany);

module.exports = router;
