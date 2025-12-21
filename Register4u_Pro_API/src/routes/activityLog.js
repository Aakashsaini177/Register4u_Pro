const express = require("express");
const { getLogs, createLog } = require("../controllers/activityLogController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// protect all routes
router.use(authenticate);

router.get("/", authorize("admin", "superadmin"), getLogs); // Only admins view logs
router.post("/", createLog);

module.exports = router;
