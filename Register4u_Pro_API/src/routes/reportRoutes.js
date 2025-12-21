const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
// const { authenticate } = require("../middleware/auth"); // Assuming reports are protected

// Prefix: /events/:eventId/reports

// 1. Room Category Summary
router.get(
  "/:eventId/reports/room-category-summary",
  reportController.getRoomCategorySummary
);

// 2. Pax Wise Summary
router.get("/:eventId/reports/pax-summary", reportController.getPaxSummary);

// 3. Hotel Wise Summary
router.get(
  "/:eventId/reports/hotel-wise-summary",
  reportController.getHotelWiseSummary
);

// 4. Date Wise Summary
router.get(
  "/:eventId/reports/date-wise-summary",
  reportController.getDateWiseSummary
);

// 5. Hotel Contact Summary
router.get(
  "/:eventId/reports/hotel-contacts",
  reportController.getHotelContactSummary
);

module.exports = router;
