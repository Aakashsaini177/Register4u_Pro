const express = require("express");
const router = express.Router();
const {
  createRequirement,
  getRequirements,
  updateRequirementStatus,
  deleteRequirement,
} = require("../controllers/requirementController");
const { authenticate } = require("../middleware/auth");

// All routes protected
router.use(authenticate);

router.post("/", createRequirement);
router.get("/", getRequirements);
router.patch("/:id/status", updateRequirementStatus);
router.delete("/:id", deleteRequirement);

module.exports = router;
