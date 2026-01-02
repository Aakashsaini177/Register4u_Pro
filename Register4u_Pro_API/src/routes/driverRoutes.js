const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const upload = require("../middleware/upload");

// Driver report routes
router.get("/reports/daily", driverController.getDriverDailyReport);
router.get("/reports/work", driverController.getDriverWorkReport);

// Driver routes
router.get("/", driverController.getAllDrivers);
router.get("/:id", driverController.getDriverById);
router.post(
  "/",
  upload.fields([
    { name: "driverPhoto", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    { name: "licensePhoto", maxCount: 1 },
    { name: "rcPhoto", maxCount: 1 },
  ]),
  driverController.createDriver
);
router.put(
  "/:id",
  upload.fields([
    { name: "driverPhoto", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    { name: "licensePhoto", maxCount: 1 },
    { name: "rcPhoto", maxCount: 1 },
  ]),
  driverController.updateDriver
);
router.delete("/:id", driverController.deleteDriver);

// Driver allotment routes
router.get("/allotments/list", driverController.getDriverAllotments);
router.get("/allotments/visitor/:visitorId", driverController.getDriverAllotmentsByVisitorId);
router.post("/allotments", driverController.createDriverAllotment);

// Update allotment route
router.put("/allotments/:id", driverController.updateDriverAllotment);

module.exports = router;
