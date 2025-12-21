const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validation");

// Login
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  authController.login
);

// Get current user
router.get("/me", authenticate, authController.getCurrentUser);

// Update preferences
router.put("/preferences", authenticate, authController.updatePreferences);

// Change password
router.put(
  "/change-password",
  [
    authenticate,
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 5 })
      .withMessage("New password must be at least 5 characters"),
    validate,
  ],
  authController.changePassword
);

// Forgot password
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required"), validate],
  authController.forgotPassword
);

// Reset password
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters"),
    validate,
  ],
  authController.resetPassword
);

module.exports = router;
