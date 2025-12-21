const express = require("express");
const {
  createInvite,
  getAllInvites,
  getInviteById,
  validateInvite,
  deleteInvite,
  updateInvite,
} = require("../controllers/inviteController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Public route to validate code
router.get("/validate/:code", validateInvite);

// Protected routes
router.use(authenticate);

// Protected routes
router.use(authenticate);

router.get("/", getAllInvites);
router.get("/:id", getInviteById);
router.post("/", createInvite);
router.put("/:id", updateInvite);
router.delete("/:id", deleteInvite);

module.exports = router;
