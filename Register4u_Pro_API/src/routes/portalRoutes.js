const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const portalController = require("../controllers/portalController");
const { authenticate } = require("../middleware/auth");
const {
  ensurePortalUser,
  allowPortalRoles,
} = require("../middleware/portalAuth");

router.post(
  "/login",
  [
    body("loginId").notEmpty().withMessage("Login ID is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  portalController.login
);

router.get("/me", authenticate, ensurePortalUser, portalController.getProfile);

router.post(
  "/change-password",
  authenticate,
  ensurePortalUser,
  [
    body("currentPassword")
      .isLength({ min: 4 })
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 4 })
      .withMessage("New password must be at least 4 characters"),
  ],
  portalController.changePassword
);

// Admin-only endpoint (reuse admin auth in future)
router.post(
  "/reset-password",
  [body("loginId").notEmpty().withMessage("Login ID is required")],
  portalController.resetPasswordToDefault
);

router.post(
  "/sync",
  authenticate,
  (req, res, next) => {
    if (req.user && req.user.userType === "portal") {
      return res.status(403).json({
        success: false,
        message: "Only admin can sync portal accounts",
      });
    }
    next();
  },
  portalController.syncAccounts
);

// Role-based data routes (currently same controller)
router.get(
  "/hotel/dashboard",
  authenticate,
  ensurePortalUser,
  allowPortalRoles("hotel"),
  portalController.getProfile
);

router.get(
  "/hotel/stats",
  authenticate,
  ensurePortalUser,
  allowPortalRoles("hotel"),
  portalController.getHotelDashboardStats
);

router.get(
  "/hotel/visitors",
  authenticate,
  ensurePortalUser,
  allowPortalRoles("hotel"),
  portalController.getHotelVisitors
);

router.get(
  "/hotel/rooms",
  authenticate,
  ensurePortalUser,
  allowPortalRoles("hotel"),
  portalController.getHotelRooms
);

router.post(
  "/scan",
  authenticate,
  ensurePortalUser,
  portalController.scanVisitor
);

router.get(
  "/driver/dashboard",
  authenticate,
  ensurePortalUser,
  allowPortalRoles("driver"),
  portalController.getProfile
);

router.get(
  "/driver/stats",
  authenticate,
  ensurePortalUser,
  allowPortalRoles("driver"),
  portalController.getDriverDashboardStats
);

router.get(
  "/travel/dashboard",
  authenticate,
  ensurePortalUser,
  allowPortalRoles("travel"),
  portalController.getProfile
);

router.get(
  "/travel/stats",
  authenticate,
  ensurePortalUser,
  allowPortalRoles("travel"),
  portalController.getTravelDashboardStats
);

module.exports = router;
