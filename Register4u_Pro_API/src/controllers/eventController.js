const { Event, Organization, Company } = require("../models");

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    console.log("📋 Fetching all events...");

    const { search = "" } = req.body || {};

    const query = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ eventName: searchRegex }, { location: searchRegex }];
    }

    const events = await Event.find(query).sort({ createdAt: -1 });

    // Map database fields to frontend-friendly fields
    const transformedEvents = await Promise.all(
      events.map(async (evt) => {
        let orgName = evt.orgId;
        let location = evt.location || evt.venue;

        if (evt.orgId) {
          try {
            // First try Company collection
            const company = await Company.findById(evt.orgId);
            if (company) {
              orgName = company.name;
              if (!location) location = company.address;
            } else {
              // If not found in Company, try Organization collection
              const org = await Organization.findById(evt.orgId);
              if (org) {
                orgName = org.name;
                if (!location) location = org.address;
              }
            }
          } catch (err) {
            console.error(
              `Error fetching org/company for event ${evt._id}:`,
              err.message
            );
          }
        }

        return {
          id: evt._id,
          eventId: evt.eventId,
          name: evt.eventName,
          eventName: evt.eventName,
          date: evt.StartTime,
          StartTime: evt.StartTime,
          EndTime: evt.EndTime,
          location: location || "N/A",
          organizer: orgName || "N/A",
          orgId: evt.orgId,
          organizationId: evt.organizationId,
          status: evt.status,
          description: evt.description,
          expectedVisitor: evt.expectedVisitor,
          eventHeadName: evt.eventHeadName,
          eventHeadEmail: evt.eventHeadEmail,
          eventHeadMob: evt.eventHeadMob,
          venue: evt.venue,
          city: evt.city,
          state: evt.state,
          pincode: evt.pincode,
          address: evt.address,
          locationUrl: evt.locationUrl,
          createdAt: evt.createdAt,
          updatedAt: evt.updatedAt,
        };
      })
    );

    console.log(`✅ Found ${events.length} events`);

    res.status(200).json({
      message: "Get All Events",
      success: true,
      data: transformedEvents,
    });
  } catch (error) {
    console.error("❌ Event Error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
        success: false,
      });
    }

    let orgName = event.orgId;
    let location = event.location || event.venue;

    if (event.orgId) {
      try {
        // First try Company collection
        const company = await Company.findById(event.orgId);
        if (company) {
          orgName = company.name;
          if (!location) location = company.address;
        } else {
          // If not found in Company, try Organization collection
          const org = await Organization.findById(event.orgId);
          if (org) {
            orgName = org.name;
            if (!location) location = org.address;
          }
        }
      } catch (err) {
        console.error(
          `Error fetching org/company for event ${event._id}:`,
          err.message
        );
      }
    }

    // Map database fields to frontend-friendly fields
    const transformedEvent = {
      id: event._id,
      eventId: event.eventId,
      name: event.eventName,
      eventName: event.eventName,
      date: event.StartTime,
      StartTime: event.StartTime,
      EndTime: event.EndTime,
      location: location || "N/A",
      organizer: orgName || "N/A",
      orgId: event.orgId,
      organizationId: event.organizationId,
      status: event.status,
      description: event.description,
      expectedVisitor: event.expectedVisitor,
      eventHeadName: event.eventHeadName,
      eventHeadEmail: event.eventHeadEmail,
      eventHeadMob: event.eventHeadMob,
      venue: event.venue,
      city: event.city,
      state: event.state,
      pincode: event.pincode,
      address: event.address,
      locationUrl: event.locationUrl,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    res.status(200).json({
      message: "Get Event",
      success: true,
      data: transformedEvent,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Helper to generate Event ID
const generateEventId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000 to 9999
  return `EVNT${randomNum}`;
};

// Create event
exports.createEvent = async (req, res) => {
  try {
    console.log("📝 Creating event:", req.body);

    // Generate unique Event ID
    let eventId = generateEventId();
    let exists = await Event.findOne({ eventId });
    while (exists) {
      eventId = generateEventId();
      exists = await Event.findOne({ eventId });
    }

    // Handle organization/company lookup
    let orgId = null;
    if (req.body.orgName) {
      // First try to find in Company collection
      const company = await Company.findOne({ name: req.body.orgName });
      if (company) {
        orgId = company._id;
      } else {
        // If not found in Company, try Organization collection
        const org = await Organization.findOne({ name: req.body.orgName });
        if (org) {
          orgId = org._id;
        }
      }
    } else if (req.body.organizer || req.body.orgId) {
      orgId = req.body.organizer || req.body.orgId;
    }

    // Map frontend fields to database fields
    const eventData = {
      eventName: req.body.name || req.body.eventName,
      eventId, // Add generated ID
      StartTime: req.body.date || req.body.StartTime || new Date(),
      EndTime: req.body.EndTime || req.body.date || new Date(),
      location: req.body.location || req.body.venue || null,
      orgId: orgId,
      organizationId: req.body.organizationId || null,
      status: req.body.status || "active",
      description: req.body.eventDescription || req.body.description || null,
      // Additional fields from frontend
      expectedVisitor: req.body.expectedVisitor || null,
      eventHeadName: req.body.eventHeadName || null,
      eventHeadEmail: req.body.eventHeadEmail || null,
      eventHeadMob: req.body.eventHeadMob || null,
      venue: req.body.venue || null,
      city: req.body.city || null,
      state: req.body.state || null,
      pincode: req.body.pincode || null,
      address: req.body.address || null,
      locationUrl: req.body.locationUrl || null,
    };

    const event = await Event.create(eventData);

    console.log("✅ Event created:", event._id);

    res.status(201).json({
      message: "Event created successfully",
      success: true,
      data: { ...event.toObject(), id: event._id },
    });
  } catch (error) {
    console.error("❌ Create Event Error:", error);
    console.error("Error details:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    // Map frontend fields to database fields for update
    const updateData = {
      ...req.body,
      eventName: req.body.name || req.body.eventName,
      StartTime: req.body.date || req.body.StartTime,
      EndTime: req.body.EndTime || req.body.date,
      location: req.body.location,
      orgId: req.body.organizer || req.body.orgId,
      organizationId: req.body.organizationId,
      description: req.body.description, // Ensure description is included
      status: req.body.status,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Event updated successfully",
      success: true,
      data: { ...event.toObject(), id: event._id },
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Event deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
