const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

// Portal settings
router.get("/portal", settingsController.getPortalSettings);
router.put("/portal", settingsController.updatePortalSettings);

// Card design settings
router.get("/card-design", settingsController.getCardDesignSettings);
router.put("/card-design", settingsController.updateCardDesignSettings);

module.exports = router;
