const { Event, Organization } = require("../models");

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
        let location = evt.location;

        if (evt.orgId) {
          try {
            const org = await Organization.findById(evt.orgId);
            if (org) {
              orgName = org.name;
              if (!location) location = org.address;
            }
          } catch (err) {
            console.error(
              `Error fetching org for event ${evt._id}:`,
              err.message
            );
          }
        }

        return {
          id: evt._id,
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
    let location = event.location;

    if (event.orgId) {
      try {
        const org = await Organization.findById(event.orgId);
        if (org) {
          orgName = org.name;
          if (!location) location = org.address;
        }
      } catch (err) {
        console.error(
          `Error fetching org for event ${event._id}:`,
          err.message
        );
      }
    }

    // Map database fields to frontend-friendly fields
    const transformedEvent = {
      id: event._id,
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

// Create event
exports.createEvent = async (req, res) => {
  try {
    console.log("📝 Creating event:", req.body);

    // Map frontend fields to database fields
    const eventData = {
      eventName: req.body.name || req.body.eventName,
      StartTime: req.body.date || req.body.StartTime || new Date(),
      EndTime: req.body.EndTime || req.body.date || new Date(),
      location: req.body.location || null,
      orgId: req.body.organizer || req.body.orgId || null,
      organizationId: req.body.organizationId || null,
      status: req.body.status || "active",
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
