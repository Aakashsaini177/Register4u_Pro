const { Visitor, Category, ActivityLog, Invite } = require("../models");
const { asyncHandler } = require("../middleware/errorHandler");
const fs = require("fs");
const path = require("path");

// Get all visitors (same format as old backend)
exports.getAllVisitors = asyncHandler(async (req, res) => {
  try {
    console.log("📋 Fetching visitors with search:", req.body.search);

    const { search = "", inviteCode } = req.body;

    const query = {};
    if (inviteCode) {
      query.inviteCode = inviteCode;
    }

    // Optimized Search with Category Name & Travel Details
    if (search) {
      const searchRegex = new RegExp(search, "i");

      // 1. Find Visitors matching search
      const visitors = await Visitor.find({
        $or: [
          { visitorId: searchRegex },
          { name: searchRegex },
          { email: searchRegex },
          { contact: searchRegex },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      // 2. Enhance with Category Name & Travel Details & Photo Resolution
      const { TravelDetail, Category } = require("../models");

      const enrichedVisitors = await Promise.all(
        visitors.map(async (v) => {
          // Resolve Category Name if it's an ID
          let categoryName = v.category;
          if (v.category && v.category.match(/^[0-9a-fA-F]{24}$/)) {
            const cat = await Category.findById(v.category).select("name");
            if (cat) categoryName = cat.name;
          }

          // Fetch Travel Details
          const travelInfo = await TravelDetail.find({ visitorId: v.visitorId })
            .populate({
              path: "hotelAllotments",
              populate: [
                { path: "hotelId", select: "hotelName" },
                { path: "roomId", select: "roomNumber" },
              ],
            })
            .populate({
              path: "driverAllotments",
              populate: {
                path: "driverId",
                select: "driverName vehicleNumber contactNumber",
              },
            })
            .lean();

          return {
            ...v,
            category: categoryName, // Override with name
            travelDetails: travelInfo, // Add travel info
          };
        })
      );

      console.log(`✅ Found & Enriched ${enrichedVisitors.length} visitors`);

      return res.status(200).json({
        message: "Get All Visitors",
        success: true,
        data: enrichedVisitors,
      });
    }

    const visitors = await Visitor.find(query).sort({ createdAt: -1 }).lean();

    console.log(`✅ Found ${visitors.length} visitors`);

    res.status(200).json({
      message: "Get All Visitors",
      success: true,
      data: visitors,
    });
  } catch (error) {
    console.error("❌ Get Visitors Error:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

// Get visitor by ID or visitorId
exports.getVisitorById = asyncHandler(async (req, res) => {
  try {
    const visitorIdParam = req.params.visitorId;
    console.log("🔍 Searching for visitor:", visitorIdParam);

    // Search by visitorId (KJ1001, CO1001) OR numeric id (if it's a valid ObjectId)
    let query = { visitorId: visitorIdParam };

    // If it looks like an ObjectId, check _id too
    if (visitorIdParam.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ visitorId: visitorIdParam }, { _id: visitorIdParam }] };
    }

    const visitor = await Visitor.findOne(query);

    if (!visitor) {
      console.log("❌ Visitor not found:", visitorIdParam);
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    console.log("✅ Visitor found:", visitor.visitorId || visitor._id);

    res.status(200).json({
      message: "Get Visitor",
      success: true,
      data: visitor,
    });
  } catch (error) {
    console.error("❌ Get Visitor Error:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

// Create visitor (Same logic as old system)
exports.createVisitor = async (req, res) => {
  try {
    console.log("📝 Creating visitor:", req.body);

    // Validate required fields
    if (!req.body.category) {
      return res.status(400).json({
        message: "Category is required",
        success: false,
      });
    }
    if (!req.body.contact) {
      return res.status(400).json({
        message: "Contact is required",
        success: false,
      });
    }

    // Check if visitor already exists with this contact
    const existingVisitor = await Visitor.findOne({
      contact: req.body.contact,
    });

    if (existingVisitor) {
      return res.status(401).json({
        message: "Visitor already exists!",
        success: false,
      });
    }

    // Get category to generate prefix
    let categoryName = "General";
    if (req.body.category) {
      // Assuming category is passed as ID, but in Mongoose it might be ID or name depending on frontend
      // If it's an ID:
      if (req.body.category.match(/^[0-9a-fA-F]{24}$/)) {
        const cat = await Category.findById(req.body.category);
        if (cat) categoryName = cat.name; // Changed from cat.category to cat.name based on model
      } else {
        // If it's passed as name or something else, handle accordingly.
        // For now assume it might be the name if not ID, or just use default.
        // But wait, the old code used `Category.findOne({ where: { id: req.body.category } })`.
        // So it expects an ID.
      }
    }

    // Step 1: Get category prefix (first 2 letters, uppercase, no spaces)
    const catPrefix = categoryName
      .replace(/\s/g, "")
      .substring(0, 2)
      .toUpperCase();

    // Step 2: Find last visitor with this prefix
    const lastVisitor = await Visitor.findOne({
      visitorId: new RegExp(`^${catPrefix}`),
    }).sort({ visitorId: -1 });

    // Step 3: Generate next number (starts at 1001)
    let nextNumber = 1001;
    if (lastVisitor && lastVisitor.visitorId) {
      const match = lastVisitor.visitorId.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }

    const newVisitorId = `${catPrefix}${nextNumber}`;

    console.log("🆔 Generated Visitor ID:", newVisitorId);

    // Prepare visitor data
    const visitorData = {
      ...req.body,
      visitorId: newVisitorId,
      paymentDetails: {
        receiptNo: req.body.receiptNo,
        amount: req.body.amount,
      },
    };

    // Handle file uploads
    console.log(
      "📁 File upload check:",
      req.files ? Object.keys(req.files) : "No files"
    );

    // ... (after rename logic)
    if (req.files) {
      const { FileNode } = require("../models"); // Import FileNode

      // PRO-TIP: Helpher to sync to File Manager
      const syncToFM = async (filename, folderName) => {
        try {
          if (!filename) return;
          // 1. Find folder
          let folder = await FileNode.findOne({
            name: folderName,
            type: "folder",
            parentId: { $ne: null },
          });
          // Note: The default folders are usually under 'uploads'.
          // But 'uploads' itself is a folder.
          // Let's find 'uploads' first, then find child.
          const root = await FileNode.findOne({
            name: "uploads",
            parentId: null,
          });
          if (root) {
            folder = await FileNode.findOne({
              name: folderName,
              parentId: root._id,
            });
          }

          if (folder) {
            // Check if file node exists
            const existingNode = await FileNode.findOne({
              name: filename,
              parentId: folder._id,
            });
            if (!existingNode) {
              await FileNode.create({
                name: filename,
                type: "file",
                parentId: folder._id,
                url: `/uploads/${filename}`, // Assuming /uploads is served statically and flat
                size: 0, // We can get size if needed, skipping for speed
                mimeType: "image/jpeg", // Generic or detect
              });
            }
          }
        } catch (e) {
          console.error("Sync to FM failed:", e);
        }
      };

      if (req.files.photo) {
        const photoFile = req.files.photo[0];
        console.log(`📸 Photo Uploaded: ${photoFile.path}`);
        visitorData.photo = photoFile.path;
      }
      // Handle documents
      visitorData.documents = {};
      const handleDoc = async (field, docName) => {
        if (req.files[field]) {
          visitorData.documents[docName] = req.files[field][0].path;
          // syncToFM deprecated or needs to handle URL. Skipping for now to avoid errors.
        }
      };

      await handleDoc("aadharFront", "aadharFront");
      await handleDoc("aadharBack", "aadharBack");
      await handleDoc("panFront", "panFront");
      await handleDoc("panBack", "panBack");
    } else if (req.body.photo) {
      // Handle photo URL from file manager
      console.log("📸 Photo URL from file manager:", req.body.photo);
      visitorData.photo = req.body.photo;
    }

    console.log("📝 Visitor data to save:", visitorData);
    const visitor = await Visitor.create(visitorData);
    // ...

    console.log("✅ Visitor created:", visitor.visitorId);
    console.log("📸 Photo saved as:", visitor.photo);

    // Log Activty
    try {
      await ActivityLog.create({
        user: req.user ? req.user.id : null, // Might be null if public (though this route seems protected? No, createVisitor is. createPublicVisitor is not)
        // Wait, createVisitor IS protected.
        action: "CREATE_VISITOR",
        module: "VISITOR",
        details: `Created visitor ${visitor.name} (${visitor.visitorId})`,
        ipAddress: req.ip,
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }

    res.status(201).json({
      message: "Visitor created successfully",
      success: true,
      data: visitor,
    });
  } catch (error) {
    console.error("❌ Create Visitor Error:", error);
    console.error("Error details:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

// Create Public Visitor (No Auth)
exports.createPublicVisitor = async (req, res) => {
  try {
    console.log("🌐 Public Visitor Registration:", req.body);
    const smsService = require("../services/smsService");
    const emailService = require("../services/emailService");

    // Validate required fields
    if (!req.body.category || !req.body.contact || !req.body.name) {
      return res
        .status(400)
        .json({ message: "Missing required fields", success: false });
    }

    const { Visitor, Category } = require("../models");
    const path = require("path");
    const fs = require("fs");

    // Check existing
    const existing = await Visitor.findOne({ contact: req.body.contact });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "You are already registered!",
        data: existing,
        isExisting: true,
      });
    }

    // ID Generation
    let categoryName = "General";
    if (req.body.category.match(/^[0-9a-fA-F]{24}$/)) {
      const cat = await Category.findById(req.body.category);
      if (cat) categoryName = cat.name;
    }
    const catPrefix = categoryName
      .replace(/\s/g, "")
      .substring(0, 2)
      .toUpperCase();

    const lastVisitor = await Visitor.findOne({
      visitorId: new RegExp(`^${catPrefix}`),
    }).sort({ visitorId: -1 });
    let nextNumber = 1001;
    if (lastVisitor?.visitorId?.match(/\d+$/)) {
      nextNumber = parseInt(lastVisitor.visitorId.match(/\d+$/)[0]) + 1;
    }
    const newVisitorId = `${catPrefix}${nextNumber}`;

    // Initialize visitorData EARLY
    const visitorData = {
      ...req.body,
      visitorId: newVisitorId,
      status: "registered",
      registrationSource: "PUBLIC_FORM",
    };

    // Handle Files
    if (req.files) {
      if (req.files.photo) {
        visitorData.photo = req.files.photo[0].path;
      }

      visitorData.documents = {};

      const handleDoc = (field) => {
        if (req.files[field]) {
          return req.files[field][0].path;
        }
        return null;
      };

      const af = handleDoc("aadharFront");
      if (af) visitorData.documents.aadharFront = af;

      const ab = handleDoc("aadharBack");
      if (ab) visitorData.documents.aadharBack = ab;

      const pf = handleDoc("panFront");
      if (pf) visitorData.documents.panFront = pf;

      const pb = handleDoc("panBack");
      if (pb) visitorData.documents.panBack = pb;
    }

    // Handle Invite Logic BEFORE Creation
    let invite = null;

    if (req.body.inviteCode) {
      // First check (optional, but good for quick fail)
      const checkInvite = await Invite.findOne({
        code: req.body.inviteCode,
        status: "ACTIVE",
      });
      if (!checkInvite) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or inactive invite code" });
      }
      if (new Date() > new Date(checkInvite.validUntil)) {
        return res
          .status(400)
          .json({ success: false, message: "Invite expired" });
      }

      // Atomic Update
      invite = await Invite.findOneAndUpdate(
        {
          code: req.body.inviteCode,
          status: "ACTIVE",
          $or: [
            { type: "MULTI", $expr: { $lt: ["$usedCount", "$maxUses"] } },
            { type: "SINGLE", usedCount: 0 },
          ],
        },
        { $inc: { usedCount: 1 } },
        { new: true }
      );

      if (!invite) {
        return res.status(400).json({
          success: false,
          message: "Invite invalid, expired or fully used",
        });
      }

      // Check status update requirements
      if (invite.type === "SINGLE" && invite.usedCount >= 1) {
        await Invite.findByIdAndUpdate(invite._id, { status: "USED" });
      } else if (
        invite.type === "MULTI" &&
        invite.maxUses > 0 &&
        invite.usedCount >= invite.maxUses
      ) {
        await Invite.findByIdAndUpdate(invite._id, { status: "EXPIRED" });
      }

      visitorData.registrationSource = "INVITE_LINK";
      visitorData.inviteCode = invite.code;
      visitorData.inviteId = invite._id;
      console.log(
        `🎟️ Invite ${invite.code} used. New count: ${invite.usedCount}`
      );
    }

    // CREATE VISITOR NOW
    const visitor = await Visitor.create(visitorData);

    // Send Notifications
    const eventLink = `${
      req.headers.origin || "http://localhost:5173"
    }/register/success/${visitor.visitorId}`;

    try {
      await smsService.sendVisitorRegistrationSMS(visitor, eventLink);
      await emailService.sendVisitorWelcomeEmail(visitor);
    } catch (err) {
      console.error("Notification failed:", err);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: visitor,
    });
  } catch (error) {
    console.error("Public Create Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update visitor
exports.updateVisitor = asyncHandler(async (req, res) => {
  try {
    const visitorId = req.params.visitorId;
    console.log("\n🔄 ===== UPDATE VISITOR REQUEST =====");
    console.log("🆔 Visitor ID:", visitorId);
    console.log("📦 Body fields:", Object.keys(req.body));
    console.log("📁 File attached:", req.file ? "✅ YES" : "❌ NO");

    const visitor = await Visitor.findById(visitorId);

    if (!visitor) {
      console.log("❌ Visitor not found:", visitorId);
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    console.log("👤 Current visitor data:");
    console.log("   Name:", visitor.name);
    console.log("   Photo:", visitor.photo || "NO PHOTO");

    const updateData = {
      ...req.body,
      paymentDetails: {
        receiptNo: req.body.receiptNo,
        amount: req.body.amount,
      },
    };

    // Handle file uploads
    // Handle file uploads
    if (req.files) {
      console.log("📁 Files uploaded:", Object.keys(req.files));

      if (req.files.photo) {
        console.log("📸 NEW PHOTO UPLOADED:", req.files.photo[0].path);
        updateData.photo = req.files.photo[0].path;
      }
    }

    // Handle photo URL from file manager (only if no new photo file was uploaded)
    if (!req.files?.photo && req.body.photo) {
      console.log("📸 Photo URL from file manager:", req.body.photo);
      updateData.photo = req.body.photo;
    }

    // Handle documents updates
    // We want to merge new files, specific body deletions (if intended), and existing docs
    const existingDocs = visitor.documents || {};
    const newDocs = { ...existingDocs }; // Start with existing

    // Check for new files
    if (req.files) {
      if (req.files.aadharFront)
        newDocs.aadharFront = req.files.aadharFront[0].path;
      if (req.files.aadharBack)
        newDocs.aadharBack = req.files.aadharBack[0].path;
      if (req.files.panFront) newDocs.panFront = req.files.panFront[0].path;
      if (req.files.panBack) newDocs.panBack = req.files.panBack[0].path;
    }

    updateData.documents = newDocs;

    console.log("📝 Applying updates...");

    const updatedVisitor = await Visitor.findByIdAndUpdate(
      visitorId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    // Log print action if card printed flag was set in this update
    try {
      const printedNow = !visitor.isCardPrinted && updateData.isCardPrinted;
      if (printedNow) {
        await ActivityLog.create({
          user: req.user ? req.user.id : null,
          action: "PRINT_VISITOR_CARD",
          module: "VISITOR",
          details: `Printed card for ${updatedVisitor.name} (${updatedVisitor.visitorId})`,
          ipAddress: req.ip,
          metadata: {
            visitorId: updatedVisitor.visitorId,
            printedBy: req.user ? req.user.name : "unknown",
          },
        });
      }
    } catch (logErr) {
      console.error("Failed to log print action:", logErr.message || logErr);
    }

    console.log("✅ UPDATE COMPLETE!");
    console.log("📸 Final photo in DB:", updatedVisitor.photo || "NO PHOTO");
    console.log("=====================================\n");

    res.status(200).json({
      message: "Visitor updated successfully",
      success: true,
      data: updatedVisitor,
    });
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

// Delete visitor
exports.deleteVisitor = asyncHandler(async (req, res) => {
  try {
    const visitorId = req.params.visitorId;
    const visitor = await Visitor.findById(visitorId);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    await Visitor.findByIdAndDelete(visitorId);

    res.status(200).json({
      message: "Visitor deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

// Delete multiple visitors
exports.deleteMultipleVisitors = asyncHandler(async (req, res) => {
  try {
    const { ids } = req.body;

    await Visitor.deleteMany({
      _id: {
        $in: ids,
      },
    });

    res.status(200).json({
      message: "Visitors deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

// Export visitors
// Export visitors
exports.exportVisitors = asyncHandler(async (req, res) => {
  try {
    const XLSX = require("xlsx");

    // Get all visitors with populated category if needed, or raw
    const visitors = await Visitor.find().lean().sort({ createdAt: -1 });

    // Transform data for Excel matching Details.xlsx format
    // [1000, "photo", "Name", "payment ", "Company Name", "Visitor ID", "Category", "Contact", "Email", "Address", "City", "Pincode", "State", "Country"]
    const data = visitors.map((v, index) => ({
      1000: index + 1, // Serial Number?
      photo: v.photo || "",
      Name: v.name,
      "payment ": v.paymentDetails?.amount || 0,
      "Company Name": v.companyName || "",
      "Visitor ID": v.visitorId,
      Category: v.category || "",
      Contact: v.contact || "",
      Email: v.email || "",
      Address: v.address || "",
      City: v.city || "",
      Pincode: v.pincode || "",
      State: v.state || "",
      Country: v.country || "",
    }));

    // Create Sheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visitors");

    // Buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Send
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=visitors.xlsx");
    res.send(buffer);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

// Mark visitor check-in
exports.markCheckIn = asyncHandler(async (req, res) => {
  try {
    const { visitorId } = req.params;
    console.log(`📍 Marking check-in for visitor: ${visitorId}`);

    // Search query similar to getVisitorById
    let query = { visitorId: visitorId };
    if (visitorId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ visitorId: visitorId }, { _id: visitorId }] };
    }

    const visitor = await Visitor.findOne(query);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    // Update status
    visitor.status = "checked-in";
    visitor.checkInTime = new Date();
    await visitor.save();

    console.log(`✅ Visitor ${visitorId} checked in at ${visitor.checkInTime}`);

    res.status(200).json({
      success: true,
      message: "Visitor checked in successfully",
      data: visitor,
    });
  } catch (error) {
    console.error("❌ Check-in Error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking check-in",
      error: error.message,
    });
  }
});

// Scan Visitor (Logs activity and returns visitor)
exports.scanVisitor = asyncHandler(async (req, res) => {
  try {
    const { visitorId } = req.body;
    
    // SAFEGUARDS
    const userName = req.user ? req.user.name : "Unknown User";
    console.log(`📷 Scan request by ${userName} for: ${visitorId}`);

    if (!visitorId) {
      return res.status(400).json({
        success: false,
        message: "Visitor ID is required",
      });
    }

    // Search query similar to getVisitorById
    let query = { visitorId: visitorId };
    if (visitorId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ visitorId: visitorId }, { _id: visitorId }] };
    }

    const visitor = await Visitor.findOne(query);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    // Log Scan Activity
    if (req.user) {
        try {
            await ActivityLog.create({
              user: req.user.id,
              action: "SCAN_VISITOR",
              module: "SCANNER",
              details: `Scanned visitor ${visitor.name} (${visitor.visitorId})`,
              ipAddress: req.ip,
              metadata: {
                visitorId: visitor.visitorId,
                scannedBy: userName,
              },
            });
        } catch (logLimitError) {
            console.error("Failed to log scan activity:", logLimitError.message);
            // Non-blocking error
        }
    }

    res.status(200).json({
      success: true,
      message: "Visitor scanned successfully",
      data: visitor,
    });
  } catch (error) {
    console.error("❌ Scan Error:", error);
    res.status(500).json({
      success: false,
      message: "Error scanning visitor",
      error: error.message,
    });
  }
});

// Get visitor history from ActivityLog
exports.getVisitorHistory = asyncHandler(async (req, res) => {
  try {
    const idParam = req.params.visitorId || req.params.id;

    // Resolve visitor to canonical visitorId and _id
    let query = { visitorId: idParam };
    if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ visitorId: idParam }, { _id: idParam }] };
    }

    const visitor = await Visitor.findOne(query).lean();

    if (!visitor) {
      return res.status(404).json({ success: false, message: "Visitor not found" });
    }

    // Search ActivityLog for entries that reference this visitor.
    // Common places: metadata.visitorId, details text, metadata.visitorObjectId
    const visitorIdentifier = visitor.visitorId || String(visitor._id);

    const logs = await ActivityLog.find({
      $or: [
        { "metadata.visitorId": visitorIdentifier },
        { details: new RegExp(visitorIdentifier, "i") },
        { "metadata.visitorObjectId": visitor._id },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(500)
      .lean();

    return res.status(200).json({ success: true, message: "Visitor history fetched", data: logs });
  } catch (error) {
    console.error("❌ Get Visitor History Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get Employee Dashboard Stats
exports.getEmployeeDashboardStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Count Total Visitors
    const totalVisitors = await Visitor.countDocuments({});

    // 2. Count My Scans Today
    const todayScans = await ActivityLog.countDocuments({
      user: userId,
      action: "SCAN_VISITOR",
      createdAt: { $gte: today },
    });

    // 3. Get Recent Activities
    const recentActivities = await ActivityLog.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate("user", "name");

    // Format activities for frontend
    const formattedActivities = recentActivities.map((log) => ({
      id: log._id,
      action: log.details, // "Scanned visitor John Doe..."
      time: new Date(log.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: log.action === "SCAN_VISITOR" ? "scan" : "other",
      date: new Date(log.timestamp).toLocaleDateString(),
    }));

    res.status(200).json({
      success: true,
      data: {
        totalVisitors,
        todayScans,
        recentActivities: formattedActivities,
      },
    });
  } catch (error) {
    console.error("❌ Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
      error: error.message,
    });
  }
});
