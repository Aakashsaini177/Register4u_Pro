const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

// Hotel routes
router.get("/", hotelController.getAllHotels);
router.get("/:id", hotelController.getHotelById);
router.post("/", hotelController.createHotel);
router.put("/:id", hotelController.updateHotel);
router.delete("/:id", hotelController.deleteHotel);

// Room allotment routes
router.get("/allotments/list", hotelController.getRoomAllotments);
router.get("/:hotelId/rooms/available", hotelController.getAvailableRooms);
router.post("/allotments", hotelController.createRoomAllotment);
router.put("/allotments/:id/status", hotelController.updateRoomAllotmentStatus);
router.put("/allotments/:id", hotelController.updateRoomAllotment);

// Hotel lists routes
router.get("/lists/:type", hotelController.getHotelLists);

module.exports = router;
