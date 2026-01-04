const express = require("express");
const router = express.Router();
const travelController = require("../controllers/travelController");

// Guest list routes (Specific paths MUST be before /:id)
router.get("/export", travelController.exportTravelReport);
router.get("/lists/arrival", travelController.getArrivalGuestList);
router.get("/lists/departure", travelController.getDepartureGuestList);

// Travel detail routes
router.get("/", travelController.getAllTravelDetails);
router.post("/", travelController.createTravelDetail);
router.get("/visitor/:visitorId", travelController.getTravelDetailByVisitorId);
router.get("/:id", travelController.getTravelDetailById);
router.put("/:id", travelController.updateTravelDetail);
router.delete("/:id", travelController.deleteTravelDetail);

// Notification routes
router.post("/:visitorId/notify", travelController.sendTravelNotification);

module.exports = router;
