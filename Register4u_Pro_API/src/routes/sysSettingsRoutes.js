const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

// Portal settings
router.get("/portal", settingsController.getPortalSettings);
router.put("/portal", settingsController.updatePortalSettings);

module.exports = router;
