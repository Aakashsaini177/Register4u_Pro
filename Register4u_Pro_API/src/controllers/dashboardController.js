const {
  Employee,
  Company,
  Event,
  Visitor,
  Category,
  HotelRoom,
} = require("../models");

// Get dashboard statistics
exports.getDashboard = async (req, res) => {
  try {
    console.log("📊 Fetching dashboard statistics...");

    // Fetch counts
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
      HotelRoom.countDocuments({ status: "occupied" }),
    ]);

    // Fetch event details for ongoing and upcoming
    const now = new Date();

    const [ongoingEvents, upcomingEvents] = await Promise.all([
      Event.countDocuments({
        StartTime: { $lte: now },
        EndTime: { $gte: now },
      }),
      Event.countDocuments({
        StartTime: { $gt: now },
      }),
    ]);

    console.log(`✅ Dashboard Stats:`);
    console.log(`   Employees: ${employeeCount}`);
    console.log(`   Volunteers: ${volunteerCount}`);
    console.log(`   Organizations: ${orgCount}`);
    console.log(`   Events: ${eventCount}`);
    console.log(`   Visitors: ${visitorsCount}`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Ongoing Events: ${ongoingEvents}`);
    console.log(`   Upcoming Events: ${upcomingEvents}`);

    res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      data: {
        employeeCount,
        volunteerCount,
        visitorsCount,
        orgCount,
        categoryCount,
        eventCount,
        ongoingEvents,
        upcomingEvents,
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
