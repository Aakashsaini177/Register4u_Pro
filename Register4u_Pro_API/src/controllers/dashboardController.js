const {
  Employee,
  Company,
  Event,
  Visitor,
  Category,
  Hotel,
  HotelRoom,
  RoomAllotment,
  ActivityLog,
} = require("../models");

// Get dashboard statistics
exports.getDashboard = async (req, res) => {
  try {
    console.log("📊 Fetching dashboard statistics...");

    // Get current date for today's stats
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get this week's start (Monday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get this month's start
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Fetch basic counts
    const [
      employeeCount,
      volunteerCount,
      visitorsCount,
      orgCount,
      categoryCount,
      eventCount,
    ] = await Promise.all([
      Employee.countDocuments({ role: "employee" }),
      Employee.countDocuments({ role: "volunteer" }),
      Visitor.countDocuments(),
      Company.countDocuments(),
      Category.countDocuments(),
      Event.countDocuments(),
    ]);

    // Real-time room occupancy data
    const [
      totalRoomsCount,
      occupiedRoomsCount,
      availableRoomsCount,
      maintenanceRoomsCount,
      activeAllotmentsCount,
      checkedInCount,
    ] = await Promise.all([
      HotelRoom.countDocuments(),
      HotelRoom.countDocuments({ status: "occupied" }),
      HotelRoom.countDocuments({ status: "available" }),
      HotelRoom.countDocuments({ status: "maintenance" }),
      RoomAllotment.countDocuments({ status: { $in: ["booked", "checked-in"] } }),
      RoomAllotment.countDocuments({ status: "checked-in" }),
    ]);

    // Hotel-wise room occupancy
    const hotelOccupancy = await Hotel.aggregate([
      {
        $lookup: {
          from: "hotelrooms",
          localField: "_id",
          foreignField: "hotelId",
          as: "rooms"
        }
      },
      {
        $lookup: {
          from: "roomallotments",
          localField: "_id",
          foreignField: "hotelId",
          pipeline: [
            { $match: { status: { $in: ["booked", "checked-in"] } } }
          ],
          as: "allotments"
        }
      },
      {
        $project: {
          hotelName: 1,
          totalRooms: { $size: "$rooms" },
          occupiedRooms: { $size: "$allotments" },
          availableRooms: {
            $subtract: [{ $size: "$rooms" }, { $size: "$allotments" }]
          },
          occupancyRate: {
            $cond: {
              if: { $gt: [{ $size: "$rooms" }, 0] },
              then: {
                $multiply: [
                  { $divide: [{ $size: "$allotments" }, { $size: "$rooms" }] },
                  100
                ]
              },
              else: 0
            }
          }
        }
      },
      { $sort: { occupancyRate: -1 } }
    ]);

    // Fetch time-based visitor stats
    const [
      todayVisitorCount,
      weekVisitorCount,
      monthVisitorCount,
    ] = await Promise.all([
      Visitor.countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      }),
      Visitor.countDocuments({
        createdAt: { $gte: startOfWeek }
      }),
      Visitor.countDocuments({
        createdAt: { $gte: startOfMonth }
      }),
    ]);

    // Fetch event details for ongoing and upcoming
    const now = new Date();
    const [ongoingEvents, upcomingEvents, pastEvents] = await Promise.all([
      Event.countDocuments({
        StartTime: { $lte: now },
        EndTime: { $gte: now },
      }),
      Event.countDocuments({
        StartTime: { $gt: now },
      }),
      Event.countDocuments({
        EndTime: { $lt: now },
      }),
    ]);

    // Get recent activities (last 10)
    const recentActivities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .lean();

    // Get visitor registration trends (last 7 days)
    const visitorTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const count = await Visitor.countDocuments({
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });
      
      visitorTrends.push({
        date: dayStart.toISOString().split('T')[0],
        count: count
      });
    }

    // Get room occupancy trends (last 7 days)
    const roomOccupancyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const occupiedCount = await RoomAllotment.countDocuments({
        status: { $in: ["booked", "checked-in"] },
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });
      
      roomOccupancyTrends.push({
        date: dayStart.toISOString().split('T')[0],
        count: occupiedCount
      });
    }

    // Get top categories by visitor count - category is stored as string
    const topCategories = await Visitor.aggregate([
      {
        $match: {
          category: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Fixed exhibitor count - category is stored as string, not ObjectId
    const exhibitorCount = await Visitor.countDocuments({
      category: { $regex: /exhibitor/i }
    });

    // Calculate occupancy percentage
    const occupancyPercentage = totalRoomsCount > 0 
      ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) 
      : 0;

    console.log(`✅ Dashboard Stats:`);
    console.log(`   Employees: ${employeeCount}`);
    console.log(`   Volunteers: ${volunteerCount}`);
    console.log(`   Organizations: ${orgCount}`);
    console.log(`   Events: ${eventCount}`);
    console.log(`   Visitors: ${visitorsCount}`);
    console.log(`   Today's Visitors: ${todayVisitorCount}`);
    console.log(`   Exhibitors: ${exhibitorCount}`);
    console.log(`   Total Rooms: ${totalRoomsCount}`);
    console.log(`   Occupied Rooms: ${occupiedRoomsCount}`);
    console.log(`   Available Rooms: ${availableRoomsCount}`);
    console.log(`   Occupancy Rate: ${occupancyPercentage}%`);

    res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      data: {
        // Basic counts
        employeeCount,
        volunteerCount,
        visitorsCount,
        orgCount,
        categoryCount,
        eventCount,
        exhibitorCount,
        
        // Real-time room data
        totalRoomsCount,
        occupiedRoomsCount,
        availableRoomsCount,
        maintenanceRoomsCount,
        activeAllotmentsCount,
        checkedInCount,
        occupancyPercentage,
        hotelOccupancy,
        
        // Time-based visitor stats
        todayVisitorCount,
        weekVisitorCount,
        monthVisitorCount,
        
        // Event stats
        ongoingEvents,
        upcomingEvents,
        pastEvents,
        
        // Analytics data
        visitorTrends,
        roomOccupancyTrends,
        topCategories,
        recentActivities: recentActivities.map(activity => ({
          id: activity._id,
          action: activity.action,
          module: activity.module,
          details: activity.details,
          user: activity.user?.name || 'System',
          createdAt: activity.createdAt,
          ipAddress: activity.ipAddress
        })),
        
        // Summary stats
        totalStats: {
          visitors: visitorsCount,
          companies: orgCount,
          events: eventCount,
          employees: employeeCount + volunteerCount,
          rooms: totalRoomsCount
        },
        
        // Real-time timestamp
        lastUpdated: new Date().toISOString()
      },
    });
  } catch (error) {
    console.error("❌ Dashboard Error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get weekly visitors with details for popup
exports.getWeeklyVisitors = async (req, res) => {
  try {
    console.log("📊 Fetching weekly visitors with details...");

    // Get current date for this week's stats
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get visitors from this week with important details
    const weeklyVisitors = await Visitor.find({
      createdAt: { $gte: startOfWeek }
    })
    .select('visitorId name email phone company category createdAt photo')
    .populate('company', 'companyName')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .lean();

    // Group visitors by day
    const visitorsByDay = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Initialize all days of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayKey = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      
      visitorsByDay[dayKey] = {
        dayName,
        date: dayKey,
        isToday: date.toDateString() === today.toDateString(),
        visitors: []
      };
    }

    // Group visitors by their registration day
    weeklyVisitors.forEach(visitor => {
      const visitorDate = new Date(visitor.createdAt);
      const dayKey = visitorDate.toISOString().split('T')[0];
      
      if (visitorsByDay[dayKey]) {
        visitorsByDay[dayKey].visitors.push({
          id: visitor._id,
          visitorId: visitor.visitorId,
          name: visitor.name,
          email: visitor.email,
          phone: visitor.phone,
          company: visitor.company?.companyName || 'N/A',
          category: visitor.category?.name || visitor.category || 'N/A',
          registrationTime: visitorDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          photo: visitor.photo
        });
      }
    });

    // Convert to array and sort by date
    const sortedDays = Object.values(visitorsByDay).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    // Calculate totals
    const totalWeekVisitors = weeklyVisitors.length;
    const todayVisitors = visitorsByDay[today.toISOString().split('T')[0]]?.visitors.length || 0;

    console.log(`✅ Weekly Visitors: ${totalWeekVisitors}, Today: ${todayVisitors}`);

    res.status(200).json({
      success: true,
      message: "Weekly visitors data retrieved successfully",
      data: {
        totalWeekVisitors,
        todayVisitors,
        visitorsByDay: sortedDays,
        weekStart: startOfWeek.toISOString(),
        weekEnd: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error("❌ Weekly Visitors Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
