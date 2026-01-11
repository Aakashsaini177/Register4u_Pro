const { generateToken } = require("../config/jwt");
const PortalAccount = require("../models/PortalAccount");
const Hotel = require("../models/Hotel");
const Driver = require("../models/Driver");
const TravelDetail = require("../models/TravelDetail");
const { asyncHandler } = require("../middleware/errorHandler");
const { syncAllPortalAccounts } = require("../services/portalAccountService");

const Employee = require("../models/Employee");
const passwordManager = require("../utils/passwordManager");
const jwt = require("jsonwebtoken");

const getEntityModel = (role) => {
  switch (role) {
    case "hotel":
      return Hotel;
    case "driver":
      return Driver;
    case "travel":
      return TravelDetail;
    default:
      return null;
  }
};

const login = asyncHandler(async (req, res) => {
  const { loginId, password } = req.body;

  // 1. Check Portal Accounts (Hotel, Driver, Travel)
  const account = await PortalAccount.findOne({
    username: loginId,
    isActive: true,
  });

  if (account) {
    const isValid = await account.comparePassword(password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken({
      userType: "portal",
      portalAccountId: account._id,
      role: account.role,
      entityId: account.entityId,
    });

    const EntityModel = getEntityModel(account.role);
    let entityName = account.username;

    if (EntityModel && account.entityId) {
      const entity = await EntityModel.findById(account.entityId);
      if (entity) {
        if (account.role === "hotel") entityName = entity.hotelName;
        if (account.role === "driver") entityName = entity.driverName;
        if (account.role === "travel")
          entityName = entity.visitorName || "Travel Desk";
      }
    }

    return res.json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: account._id,
        loginId: account.username,
        role: account.role,
        name: entityName,
      },
    });
  }

  // 2. Check Employee Login
  // If no portal account found, check if it's an employee
  const employee = await Employee.findOne({
    username: loginId.toLowerCase(),
    login_enabled: true,
  });

  if (employee) {
    const isValidPassword = await passwordManager.verifyPassword(
      password,
      employee.password
    );

    if (isValidPassword) {
      const role =
        employee.emp_type === "permanent" ? "permanent_employee" : "volunteer";

      // Generate standard JWT token compatible with other employee routes
      const token = jwt.sign(
        {
          id: employee.id,
          email: employee.email,
          role: role,
          type: "employee",
        },
        process.env.JWT_SECRET || "register4u-secret-key",
        { expiresIn: "7d" }
      );

      // Update last login
      await employee.updateOne({
        last_login: new Date(),
        login_attempts: 0,
      });

      return res.json({
        success: true,
        message: "Employee login successful",
        token, // Add token at top level too for consistency
        data: {
          token, // Keep nested for compatibility
          user: {
            id: employee.id,
            name: employee.fullName,
            email: employee.email,
            role: role, // 'permanent_employee' or 'volunteer'
            type: "employee",
            emp_type: employee.emp_type,
          },
          role: "employee", // Signal explicitly that this is an employee login
        },
      });
    }
  }

  // If nothing matched
  return res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const { role, entityId } = req.user;

  const Model = getEntityModel(role);
  if (!Model) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
    });
  }

  let query = Model.findById(entityId);

  // Populate based on role
  if (role === "hotel") {
    query = query
      .populate({
        path: "categories",
        populate: { path: "rooms" },
      })
      .populate({
        path: "allotments",
        populate: { path: "roomId", model: "HotelRoom" },
      });
  } else if (role === "driver") {
    query = query.populate({
      path: "allotments",
    });
  } else if (role === "travel") {
    query = query
      .populate({
        path: "hotelAllotments",
        populate: [
          { path: "hotelId", model: "Hotel" },
          { path: "roomId", model: "HotelRoom" },
        ],
      })
      .populate({
        path: "driverAllotments",
        populate: { path: "driverId", model: "Driver" },
      });
  }

  const entity = await query;

  if (!entity) {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  const account = await PortalAccount.findOne({
    role,
    entityId,
  }).select("-password");

  // Transform entity to match old structure if needed
  let entityObj = entity.toObject();
  entityObj.id = entity._id;

  if (role === "hotel" && entityObj.allotments) {
    entityObj.allotments = entityObj.allotments.map((a) => ({
      ...a,
      room: a.roomId,
    }));
  }
  if (role === "travel") {
    if (entityObj.hotelAllotments) {
      entityObj.hotelAllotments = entityObj.hotelAllotments.map((a) => ({
        ...a,
        hotel: a.hotelId,
        room: a.roomId,
      }));
    }
    if (entityObj.driverAllotments) {
      entityObj.driverAllotments = entityObj.driverAllotments.map((a) => ({
        ...a,
        driver: a.driverId,
      }));
    }
  }

  if (!account) {
    return res.status(401).json({
      success: false,
      message: "Account not found. Please login again.",
    });
  }

  res.json({
    success: true,
    data: {
      account: {
        ...account.toObject(),
        id: account._id,
        loginId: account.username,
      },
      entity: entityObj,
    },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { portalAccountId } = req.user;

  const account = await PortalAccount.findById(portalAccountId);

  if (!account) {
    return res.status(404).json({
      success: false,
      message: "Account not found",
    });
  }

  const isValid = await account.comparePassword(currentPassword);

  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  account.password = newPassword;
  // account.mustChangePassword = false;
  await account.save();

  res.json({
    success: true,
    message: "Password updated successfully",
  });
});

const resetPasswordToDefault = asyncHandler(async (req, res) => {
  const { loginId } = req.body;

  const account = await PortalAccount.findOne({ username: loginId });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: "Account not found",
    });
  }

  account.password = loginId;
  // account.mustChangePassword = true;
  await account.save();

  res.json({
    success: true,
    message: "Password reset to default successfully",
  });
});

const syncAccounts = asyncHandler(async (req, res) => {
  const results = await syncAllPortalAccounts();

  res.json({
    success: true,
    message: "Portal accounts synchronised successfully",
    data: results,
  });
});

const getHotelDashboardStats = asyncHandler(async (req, res) => {
  const { entityId } = req.user;
  // entityId is the Hotel ID

  // 1. Get Hotel details
  const hotel = await Hotel.findById(entityId);
  if (!hotel) {
    return res.status(404).json({ success: false, message: "Hotel not found" });
  }

  // 2. Count Total Rooms
  // Assuming categories -> rooms structure
  // We need to fetch hotel populated with categories and rooms if we want exact count
  // or maybe just rely on allotments for now?
  // Let's count rooms from categories
  const hotelWithRooms = await Hotel.findById(entityId).populate({
    path: "categories",
    populate: { path: "rooms" },
  });

  let totalRooms = 0;
  hotelWithRooms.categories.forEach((cat) => {
    totalRooms += cat.rooms.length;
  });

  // 3. Count Occupied Rooms
  // Find all active HotelAllotments for this hotel
  // We need to find TravelDetails where hotelAllotments.hotelId == entityId
  // And status is active? (Assuming checked-in visitors = occupied)
  // Actually, let's look at `HotelAllotment` embedded in TravelDetail.

  // Find TravelDetails that have this hotel in allotments
  const travelDetails = await TravelDetail.find({
    "hotelAllotments.hotelId": entityId,
  }).populate("visitorId");

  let occupiedRooms = 0;
  let recentGuests = [];

  travelDetails.forEach((travel) => {
    travel.hotelAllotments.forEach((allotment) => {
      if (allotment.hotelId.toString() === entityId.toString()) {
        occupiedRooms++;

        if (travel.visitorId) {
          recentGuests.push({
            id: travel.visitorId._id,
            name: travel.visitorId.name,
            room: allotment.roomNumber || "Assigned", // Need to populate room if stored as ID
            checkIn: allotment.checkInDate,
            checkOut: allotment.checkOutDate,
          });
        }
      }
    });
  });

  // Sort recent guests by check-in date
  recentGuests.sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));

  // 4. Today's Check-ins
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCheckIns = recentGuests.filter((g) => {
    const d = new Date(g.checkIn);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  }).length;

  res.json({
    success: true,
    data: {
      stats: {
        totalRooms,
        occupiedRooms,
        todayCheckIns,
        availableRooms: totalRooms - occupiedRooms,
      },
      recentGuests: recentGuests.slice(0, 10), // Top 10
    },
  });
});

const getDriverDashboardStats = asyncHandler(async (req, res) => {
  const { entityId } = req.user;
  // entityId is Driver ID

  // 1. Get Driver
  const driver = await Driver.findById(entityId);

  // 2. Get Assigned Trips
  const trips = await TravelDetail.find({
    "driverAllotments.driverId": entityId,
  }).populate("visitorId");

  let upcomingTrips = [];
  let completedTrips = 0;

  trips.forEach((travel) => {
    travel.driverAllotments.forEach((allotment) => {
      if (allotment.driverId.toString() === entityId.toString()) {
        const tripDate = new Date(travel.arrivalDate || travel.departureDate); // Fallback

        upcomingTrips.push({
          id: travel._id,
          visitorName: travel.visitorId?.name || "Guest",
          type: travel.type, // arrival/departure
          date: tripDate,
          time: travel.arrivalTime || travel.departureTime,
          location:
            travel.type === "arrival"
              ? travel.arrivalLocation
              : travel.departureLocation,
        });
      }
    });
  });

  // Sort by date upcoming
  upcomingTrips.sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json({
    success: true,
    data: {
      stats: {
        totalTrips: upcomingTrips.length,
        todayTrips: upcomingTrips.filter(
          (t) => new Date(t.date).getDate() === new Date().getDate()
        ).length,
      },
      upcomingTrips: upcomingTrips.slice(0, 10),
    },
  });
});

const getTravelDashboardStats = asyncHandler(async (req, res) => {
  // Travel Desk sees ALL request overview

  // 1. Total Arrivals Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const arrivals = await TravelDetail.find({
    type: "arrival",
    arrivalDate: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  }).countDocuments();

  // 2. Total Departures Today
  const departures = await TravelDetail.find({
    type: "departure",
    departureDate: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  }).countDocuments();

  // 3. Pending Allocations (No driver assigned)
  const pendingRequests = await TravelDetail.find({
    driverAllotments: { $size: 0 },
  })
    .populate("visitorId")
    .limit(10);

  const pendingList = pendingRequests.map((req) => ({
    id: req._id,
    visitorName: req.visitorId?.name || "Unknown",
    type: req.type,
    date: req.arrivalDate || req.departureDate,
  }));

  res.json({
    success: true,
    data: {
      stats: {
        todayArrivals: arrivals,
        todayDepartures: departures,
        pendingCount: pendingRequests.length,
      },
      pendingRequests: pendingList,
    },
  });
});

// NEW METHODS

const getHotelVisitors = asyncHandler(async (req, res) => {
  const hotelId = req.user.entityId;

  // Find RoomAllotments for this hotel
  // We need to return Visitor data, but RoomAllotment links Visitor <-> Hotel
  const RoomAllotment = require("../models/RoomAllotment");

  const allotments = await RoomAllotment.find({ hotelId })
    .populate("visitorId") // Assuming this refs Visitor model? Actually schema says visitorId is String or Ref?
    // Let's check RoomAllotment model. It has visitorId (String) and visitorName usually.
    // If we need detailed visitor info, we usually look up by ID.
    // Based on previous code: visitorId seems to be string ID.
    // Let's just return the allotment data which contains visitor info + room info.
    .populate({
      path: "roomId",
      model: "HotelRoom",
    })
    .sort({ checkInDate: 1 });

  const data = allotments.map((a) => ({
    id: a._id,
    visitorId: a.visitorId, // This is the ID string stored in RoomAllotment
    visitorName: a.visitorName,
    visitorNumber: a.visitorNumber,
    checkInDate: a.checkInDate,
    checkOutDate: a.checkOutDate,
    room: a.roomId,
    status:
      a.status ||
      (new Date(a.checkInDate) > new Date() ? "upcoming" : "checked-in"),
  }));

  res.json({
    success: true,
    data,
  });
});

const getHotelRooms = asyncHandler(async (req, res) => {
  const hotelId = req.user.entityId;
  const PortalRoom = require("../models/PortalRoom");

  const rooms = await PortalRoom.find({ hotelId })
    .populate("categoryId", "categoryName occupancy")
    .sort({ roomNumber: 1 });

  const data = rooms.map((r) => ({
    id: r._id,
    roomNumber: r.roomNumber,
    categoryId: r.categoryId._id,
    categoryName: r.categoryId?.categoryName,
    occupancy: r.categoryId?.occupancy,
    capacity: r.capacity,
    price: r.price,
    amenities: r.amenities,
    status: r.status,
    currentGuest: r.currentGuest,
    checkIn: r.checkIn,
    checkOut: r.checkOut,
  }));

  res.json({
    success: true,
    data,
  });
});

const scanVisitor = asyncHandler(async (req, res) => {
  const { visitorId } = req.body;
  const Visitor = require("../models/Visitor");

  // Simple lookup. In future: Check if visitor is allotted to this hotel?
  const visitor = await Visitor.findOne({ visitorId }).lean();

  if (!visitor) {
    return res.status(404).json({
      success: false,
      message: "Visitor not found",
    });
  }

  // Return info
  res.json({
    success: true,
    data: visitor,
  });
});

// Hotel Category Management Functions
const getHotelCategories = asyncHandler(async (req, res) => {
  const hotelId = req.user.entityId;
  const HotelCategory = require("../models/HotelCategory");

  const categories = await HotelCategory.find({ hotelId })
    .sort({ categoryName: 1 });

  const data = categories.map((c) => ({
    id: c._id,
    categoryName: c.categoryName,
    occupancy: c.occupancy,
    numberOfRooms: c.numberOfRooms,
  }));

  res.json({
    success: true,
    data,
  });
});

const addHotelCategory = asyncHandler(async (req, res) => {
  const hotelId = req.user.entityId;
  const HotelCategory = require("../models/HotelCategory");
  const { categoryName, occupancy } = req.body;

  // Check if category name already exists for this hotel
  const existingCategory = await HotelCategory.findOne({ hotelId, categoryName });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: "Category name already exists",
    });
  }

  const category = new HotelCategory({
    hotelId,
    categoryName,
    occupancy: occupancy || 1,
    numberOfRooms: 0,
  });

  await category.save();

  res.status(201).json({
    success: true,
    message: "Category added successfully",
    data: category,
  });
});

const updateHotelCategory = asyncHandler(async (req, res) => {
  const hotelId = req.user.entityId;
  const categoryId = req.params.id;
  const HotelCategory = require("../models/HotelCategory");
  const { categoryName, occupancy } = req.body;

  const category = await HotelCategory.findOne({ _id: categoryId, hotelId });
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  // Check if category name is being changed and if it conflicts
  if (categoryName !== category.categoryName) {
    const existingCategory = await HotelCategory.findOne({ hotelId, categoryName });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }
  }

  category.categoryName = categoryName;
  category.occupancy = occupancy || 1;

  await category.save();

  res.json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

const deleteHotelCategory = asyncHandler(async (req, res) => {
  const hotelId = req.user.entityId;
  const categoryId = req.params.id;
  const HotelCategory = require("../models/HotelCategory");
  const PortalRoom = require("../models/PortalRoom");

  const category = await HotelCategory.findOne({ _id: categoryId, hotelId });
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  // Check if category has rooms
  const roomsCount = await PortalRoom.countDocuments({ categoryId });
  if (roomsCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category. It has ${roomsCount} rooms assigned.`,
    });
  }

  await HotelCategory.findByIdAndDelete(categoryId);

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});

const addHotelRoom = asyncHandler(async (req, res) => {
  const hotelId = req.user.entityId;
  const PortalRoom = require("../models/PortalRoom");
  const HotelCategory = require("../models/HotelCategory");
  const { roomNumber, categoryId, capacity, price, amenities, status } = req.body;

  // Verify category belongs to this hotel
  const category = await HotelCategory.findOne({ _id: categoryId, hotelId });
  if (!category) {
    return res.status(400).json({
      success: false,
      message: "Invalid category selected",
    });
  }

  // Check if room number already exists for this hotel
  const existingRoom = await PortalRoom.findOne({ hotelId, roomNumber });
  if (existingRoom) {
    return res.status(400).json({
      success: false,
      message: "Room number already exists",
    });
  }

  const room = new PortalRoom({
    hotelId,
    categoryId,
    roomNumber,
    capacity,
    price: price || 0,
    amenities: amenities || "",
    status: status || "available",
  });

  await room.save();

  // Update category room count
  await HotelCategory.findByIdAndUpdate(categoryId, {
    $inc: { numberOfRooms: 1 }
  });

  res.status(201).json({
    success: true,
    message: "Room added successfully",
    data: room,
  });
});

const updateHotelRoom = asyncHandler(async (req, res) => {
  const hotelId = req.user.entityId;
  const roomId = req.params.id;
  const PortalRoom = require("../models/PortalRoom");
  const HotelCategory = require("../models/HotelCategory");
  const { roomNumber, categoryId, capacity, price, amenities, status, currentGuest, checkIn, checkOut } = req.body;

  const room = await PortalRoom.findOne({ _id: roomId, hotelId });
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found",
    });
  }

  // Verify new category belongs to this hotel
  const category = await HotelCategory.findOne({ _id: categoryId, hotelId });
  if (!category) {
    return res.status(400).json({
      success: false,
      message: "Invalid category selected",
    });
  }

  // Check if room number is being changed and if it conflicts
  if (roomNumber !== room.roomNumber) {
    const existingRoom = await PortalRoom.findOne({ hotelId, roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Room number already exists",
      });
    }
  }

  // Update category room counts if category changed
  if (categoryId !== room.categoryId.toString()) {
    await HotelCategory.findByIdAndUpdate(room.categoryId, {
      $inc: { numberOfRooms: -1 }
    });
    await HotelCategory.findByIdAndUpdate(categoryId, {
      $inc: { numberOfRooms: 1 }
    });
  }

  // Update room fields
  room.roomNumber = roomNumber;
  room.categoryId = categoryId;
  room.capacity = capacity;
  room.price = price || 0;
  room.amenities = amenities || "";
  room.status = status || "available";
  room.currentGuest = currentGuest || null;
  room.checkIn = checkIn || null;
  room.checkOut = checkOut || null;

  await room.save();

  res.json({
    success: true,
    message: "Room updated successfully",
    data: room,
  });
});

const deleteHotelRoom = asyncHandler(async (req, res) => {
  const hotelId = req.user.entityId;
  const roomId = req.params.id;
  const PortalRoom = require("../models/PortalRoom");
  const HotelCategory = require("../models/HotelCategory");

  const room = await PortalRoom.findOne({ _id: roomId, hotelId });
  if (!room) {
    return res.status(404).json({
      success: false,
      message: "Room not found",
    });
  }

  // Update category room count
  await HotelCategory.findByIdAndUpdate(room.categoryId, {
    $inc: { numberOfRooms: -1 }
  });

  await PortalRoom.findByIdAndDelete(roomId);

  res.json({
    success: true,
    message: "Room deleted successfully",
  });
});

module.exports = {
  login,
  getProfile,
  changePassword,
  resetPasswordToDefault,
  syncAccounts,
  getHotelDashboardStats,
  getDriverDashboardStats,
  getTravelDashboardStats,
  getHotelVisitors,
  getHotelRooms,
  getHotelCategories,
  addHotelCategory,
  updateHotelCategory,
  deleteHotelCategory,
  addHotelRoom,
  updateHotelRoom,
  deleteHotelRoom,
  scanVisitor,
};
