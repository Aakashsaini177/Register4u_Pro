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

    // Enhanced Search with Company Name, City, Category Name & Travel Details
    if (search) {
      const searchTerm = search.trim();
      const searchRegex = new RegExp(searchTerm, "i");

      // 1. Find Categories matching search term
      const { TravelDetail, Category } = require("../models");
      const matchingCategories = await Category.find({
        name: searchRegex,
      })
        .select("_id")
        .lean();

      const categoryIds = matchingCategories.map((cat) => cat._id.toString());

      // 2. Build comprehensive search query
      const orConditions = [
        // Direct field searches
        { visitorId: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { contact: searchRegex },
        { city: searchRegex },
        { companyName: searchRegex },

        // Category searches (both name and ID)
        { category: searchRegex }, // Direct category name
        { category: { $in: categoryIds } }, // Category by ID reference
      ];

      // Check if search term is a valid ObjectId (24 char hex)
      if (searchTerm.match(/^[0-9a-fA-F]{24}$/)) {
        orConditions.push({ _id: searchTerm });
        // Also add to category ID if it might be a category ID
        categoryIds.push(searchTerm);
      }

      const searchQuery = {
        $or: orConditions,
      };

      // 3. Find Visitors matching enhanced search
      const visitors = await Visitor.find(searchQuery)
        .sort({ createdAt: -1 })
        .lean();

      // 4. Enhance with Category Name & Travel Details & Photo Resolution
      const enrichedVisitors = await Promise.all(
        visitors.map(async (v) => {
          // Resolve Category Name if it's an ID
          let categoryName = v.category;
          if (v.category && v.category.match(/^[0-9a-fA-F]{24}$/)) {
            const cat = await Category.findById(v.category).select("name");
            if (cat) categoryName = cat.name;
          }

          // If categoryName is still undefined/null, keep original category or set to empty string
          if (!categoryName) {
            categoryName = v.category || "";
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
        }),
      );

      console.log(
        `✅ Enhanced Search: Found ${enrichedVisitors.length} visitors for "${search}"`,
      );

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
      req.files ? Object.keys(req.files) : "No files",
    );

    if (req.files) {
      const { FileNode } = require("../models"); // Import FileNode
      const path = require("path");
      const fs = require("fs");

      // Helper to sync files to File Manager with proper naming
      const syncToFileManager = async (
        originalFile,
        newFileName,
        folderName,
      ) => {
        try {
          if (!originalFile || !newFileName) return null;

          // Find the target folder (photo or idproof)
          let folder = await FileNode.findOne({
            name: folderName,
            type: "folder",
            parentId: null, // Root level folders
          });

          if (!folder) {
            // Create folder if it doesn't exist
            folder = await FileNode.create({
              name: folderName,
              type: "folder",
              parentId: null,
            });
            console.log(`📁 Created folder: ${folderName}`);
          }

          // Get file extension from original file
          const ext = path.extname(originalFile.originalname);
          const finalFileName = `${newFileName}${ext}`;

          // Create new file path
          const uploadsDir = path.join(__dirname, "../../uploads");
          const newFilePath = path.join(uploadsDir, finalFileName);

          // Copy/rename the uploaded file
          if (fs.existsSync(originalFile.path)) {
            fs.copyFileSync(originalFile.path, newFilePath);
            console.log(`📁 File copied to: ${finalFileName}`);
          }

          // Check if file node already exists in file manager
          const existingNode = await FileNode.findOne({
            name: finalFileName,
            parentId: folder._id,
          });

          if (!existingNode) {
            // Create file node in file manager
            await FileNode.create({
              name: finalFileName,
              type: "file",
              parentId: folder._id,
              url: `/uploads/${finalFileName}`,
              size: originalFile.size || 0,
              mimeType: originalFile.mimetype || "image/jpeg",
            });
            console.log(
              `📁 Added to file manager: ${finalFileName} in ${folderName}`,
            );
          }

          return finalFileName;
        } catch (error) {
          console.error("Sync to File Manager failed:", error);
          return null;
        }
      };

      // Handle visitor photo
      if (req.files.photo) {
        const photoFile = req.files.photo[0];
        console.log(`📸 Photo Uploaded: ${photoFile.path}`);
        console.log(
          `🔧 DEBUG: Using UPDATED photo upload logic - Cloudinary only!`,
        );

        // Always use Cloudinary URL if available, and store it properly in file manager
        if (
          photoFile.path &&
          (photoFile.path.includes("cloudinary") ||
            photoFile.path.startsWith("http"))
        ) {
          visitorData.photo = photoFile.path; // Keep Cloudinary URL in visitor record
          console.log(`✅ Cloudinary URL detected: ${photoFile.path}`);

          // Add to file manager with Cloudinary URL (not local path)
          try {
            const { FileNode } = require("../models");
            let folder = await FileNode.findOne({
              name: "photo",
              type: "folder",
              parentId: null,
            });

            if (!folder) {
              folder = await FileNode.create({
                name: "photo",
                type: "folder",
                parentId: null,
              });
            }

            const ext = path.extname(photoFile.originalname) || ".jpg";
            const finalFileName = `${newVisitorId}${ext}`;

            const existingNode = await FileNode.findOne({
              name: finalFileName,
              parentId: folder._id,
            });

            if (!existingNode) {
              await FileNode.create({
                name: finalFileName,
                type: "file",
                parentId: folder._id,
                url: photoFile.path, // Store Cloudinary URL in file manager - this fixes the display issue
                size: photoFile.size || 0,
                mimeType: photoFile.mimetype || "image/jpeg",
              });
              console.log(
                `📁 ✅ CLOUDINARY: Added photo to file manager with Cloudinary URL: ${finalFileName} -> ${photoFile.path}`,
              );
            } else {
              console.log(
                `📁 Photo already exists in file manager: ${finalFileName}`,
              );
            }
          } catch (error) {
            console.error("Error adding photo to file manager:", error);
          }
        } else {
          // Local file handling (fallback) - only if not Cloudinary
          console.log(
            `⚠️  WARNING: Photo is not Cloudinary URL, using local fallback: ${photoFile.path}`,
          );
          const photoFileName = await syncToFileManager(
            photoFile,
            newVisitorId,
            "photo",
          );
          visitorData.photo = photoFileName
            ? `/uploads/${photoFileName}`
            : photoFile.path;
        }
      }

      // Handle ID proof documents
      visitorData.documents = {};

      // Helper function to handle document with Cloudinary support
      const handleDocument = async (fileArray, fileName, folderName) => {
        if (!fileArray || !fileArray[0]) return null;

        const file = fileArray[0];

        // If file is on Cloudinary, use that URL and add to file manager
        if (
          file.path &&
          (file.path.includes("cloudinary") || file.path.startsWith("http"))
        ) {
          try {
            const { FileNode } = require("../models");
            let folder = await FileNode.findOne({
              name: folderName,
              type: "folder",
              parentId: null,
            });

            if (!folder) {
              folder = await FileNode.create({
                name: folderName,
                type: "folder",
                parentId: null,
              });
            }

            const ext = path.extname(file.originalname) || ".jpg";
            const finalFileName = `${fileName}${ext}`;

            const existingNode = await FileNode.findOne({
              name: finalFileName,
              parentId: folder._id,
            });

            if (!existingNode) {
              await FileNode.create({
                name: finalFileName,
                type: "file",
                parentId: folder._id,
                url: file.path, // Use Cloudinary URL
                size: file.size || 0,
                mimeType: file.mimetype || "image/jpeg",
              });
              console.log(
                `📁 Added ${fileName} to file manager with Cloudinary URL`,
              );
            }
          } catch (error) {
            console.error(`Error adding ${fileName} to file manager:`, error);
          }

          return file.path; // Return Cloudinary URL
        } else {
          // Local file handling
          const localFileName = await syncToFileManager(
            file,
            fileName,
            folderName,
          );
          return localFileName ? `/uploads/${localFileName}` : file.path;
        }
      };

      // Aadhar Front
      if (req.files.aadharFront) {
        visitorData.documents.aadharFront = await handleDocument(
          req.files.aadharFront,
          `aadhrFR_${newVisitorId}`,
          "idproof",
        );
      }

      // Aadhar Back
      if (req.files.aadharBack) {
        visitorData.documents.aadharBack = await handleDocument(
          req.files.aadharBack,
          `aadhrBK_${newVisitorId}`,
          "idproof",
        );
      }

      // PAN Card
      if (req.files.panFront) {
        visitorData.documents.panFront = await handleDocument(
          req.files.panFront,
          `PAN_${newVisitorId}`,
          "idproof",
        );
      }

      // PAN Back (if needed)
      if (req.files.panBack) {
        visitorData.documents.panBack = await handleDocument(
          req.files.panBack,
          `PANBACK_${newVisitorId}`,
          "idproof",
        );
      }
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

    // Log Activity
    try {
      const userName = req.user ? req.user.name || req.user.fullName : "System";
      await ActivityLog.create({
        user: req.user ? req.user.id : null,
        userModel: req.user ? "Employee" : "Admin", // Specify user type
        action: "CREATE_VISITOR",
        module: "VISITOR",
        details: `Created visitor ${visitor.name} (${visitor.visitorId}) by ${userName}`,
        ipAddress: req.ip,
        metadata: {
          visitorId: visitor.visitorId,
          createdBy: userName,
        },
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

    // Handle Files with File Manager Sync
    if (req.files) {
      const { FileNode } = require("../models");
      const path = require("path");
      const fs = require("fs");

      // Helper to sync files to File Manager with proper naming
      const syncToFileManager = async (
        originalFile,
        newFileName,
        folderName,
      ) => {
        try {
          if (!originalFile || !newFileName) return null;

          // Find the target folder (photo or idproof)
          let folder = await FileNode.findOne({
            name: folderName,
            type: "folder",
            parentId: null, // Root level folders
          });

          if (!folder) {
            // Create folder if it doesn't exist
            folder = await FileNode.create({
              name: folderName,
              type: "folder",
              parentId: null,
            });
            console.log(`📁 Created folder: ${folderName}`);
          }

          // Get file extension from original file
          const ext = path.extname(originalFile.originalname);
          const finalFileName = `${newFileName}${ext}`;

          // Create new file path
          const uploadsDir = path.join(__dirname, "../../uploads");
          const newFilePath = path.join(uploadsDir, finalFileName);

          // Copy/rename the uploaded file
          if (fs.existsSync(originalFile.path)) {
            fs.copyFileSync(originalFile.path, newFilePath);
            console.log(`📁 File copied to: ${finalFileName}`);
          }

          // Check if file node already exists in file manager
          const existingNode = await FileNode.findOne({
            name: finalFileName,
            parentId: folder._id,
          });

          if (!existingNode) {
            // Create file node in file manager
            await FileNode.create({
              name: finalFileName,
              type: "file",
              parentId: folder._id,
              url: `/uploads/${finalFileName}`,
              size: originalFile.size || 0,
              mimeType: originalFile.mimetype || "image/jpeg",
            });
            console.log(
              `📁 Added to file manager: ${finalFileName} in ${folderName}`,
            );
          }

          return finalFileName;
        } catch (error) {
          console.error("Sync to File Manager failed:", error);
          return null;
        }
      };

      // Handle visitor photo
      if (req.files.photo) {
        const photoFile = req.files.photo[0];

        // Always use Cloudinary URL if available, and store it properly in file manager
        if (
          photoFile.path &&
          (photoFile.path.includes("cloudinary") ||
            photoFile.path.startsWith("http"))
        ) {
          visitorData.photo = photoFile.path; // Keep Cloudinary URL in visitor record

          // Add to file manager with Cloudinary URL (not local path)
          try {
            const { FileNode } = require("../models");
            let folder = await FileNode.findOne({
              name: "photo",
              type: "folder",
              parentId: null,
            });

            if (!folder) {
              folder = await FileNode.create({
                name: "photo",
                type: "folder",
                parentId: null,
              });
            }

            const ext = path.extname(photoFile.originalname) || ".jpg";
            const finalFileName = `${newVisitorId}${ext}`;

            const existingNode = await FileNode.findOne({
              name: finalFileName,
              parentId: folder._id,
            });

            if (!existingNode) {
              await FileNode.create({
                name: finalFileName,
                type: "file",
                parentId: folder._id,
                url: photoFile.path, // Store Cloudinary URL in file manager - this fixes the display issue
                size: photoFile.size || 0,
                mimeType: photoFile.mimetype || "image/jpeg",
              });
              console.log(
                `📁 Added photo to file manager with Cloudinary URL: ${finalFileName} -> ${photoFile.path}`,
              );
            } else {
              console.log(
                `📁 Photo already exists in file manager: ${finalFileName}`,
              );
            }
          } catch (error) {
            console.error("Error adding photo to file manager:", error);
          }
        } else {
          // Local file handling (fallback) - only if not Cloudinary
          const photoFileName = await syncToFileManager(
            photoFile,
            newVisitorId,
            "photo",
          );
          visitorData.photo = photoFileName
            ? `/uploads/${photoFileName}`
            : photoFile.path;
        }
      }

      // Handle ID proof documents with Cloudinary support
      visitorData.documents = {};

      // Helper function to handle document with Cloudinary support
      const handleDocument = async (fileArray, fileName, folderName) => {
        if (!fileArray || !fileArray[0]) return null;

        const file = fileArray[0];

        // If file is on Cloudinary, use that URL and add to file manager
        if (
          file.path &&
          (file.path.includes("cloudinary") || file.path.startsWith("http"))
        ) {
          try {
            const { FileNode } = require("../models");
            let folder = await FileNode.findOne({
              name: folderName,
              type: "folder",
              parentId: null,
            });

            if (!folder) {
              folder = await FileNode.create({
                name: folderName,
                type: "folder",
                parentId: null,
              });
            }

            const ext = path.extname(file.originalname) || ".jpg";
            const finalFileName = `${fileName}${ext}`;

            const existingNode = await FileNode.findOne({
              name: finalFileName,
              parentId: folder._id,
            });

            if (!existingNode) {
              await FileNode.create({
                name: finalFileName,
                type: "file",
                parentId: folder._id,
                url: file.path, // Use Cloudinary URL
                size: file.size || 0,
                mimeType: file.mimetype || "image/jpeg",
              });
              console.log(
                `📁 Added ${fileName} to file manager with Cloudinary URL`,
              );
            }
          } catch (error) {
            console.error(`Error adding ${fileName} to file manager:`, error);
          }

          return file.path; // Return Cloudinary URL
        } else {
          // Local file handling
          const localFileName = await syncToFileManager(
            file,
            fileName,
            folderName,
          );
          return localFileName ? `/uploads/${localFileName}` : file.path;
        }
      };

      // Aadhar Front
      if (req.files.aadharFront) {
        visitorData.documents.aadharFront = await handleDocument(
          req.files.aadharFront,
          `aadhrFR_${newVisitorId}`,
          "idproof",
        );
      }

      // Aadhar Back
      if (req.files.aadharBack) {
        visitorData.documents.aadharBack = await handleDocument(
          req.files.aadharBack,
          `aadhrBK_${newVisitorId}`,
          "idproof",
        );
      }

      // PAN Card
      if (req.files.panFront) {
        visitorData.documents.panFront = await handleDocument(
          req.files.panFront,
          `PAN_${newVisitorId}`,
          "idproof",
        );
      }

      // PAN Back (if needed)
      if (req.files.panBack) {
        visitorData.documents.panBack = await handleDocument(
          req.files.panBack,
          `PANBACK_${newVisitorId}`,
          "idproof",
        );
      }
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
        { new: true },
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
        `🎟️ Invite ${invite.code} used. New count: ${invite.usedCount}`,
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

    // Handle file uploads with File Manager Sync
    if (req.files) {
      console.log("📁 Files uploaded:", Object.keys(req.files));

      const { FileNode } = require("../models");
      const path = require("path");
      const fs = require("fs");

      // Helper to sync files to File Manager with proper naming
      const syncToFileManager = async (
        originalFile,
        newFileName,
        folderName,
      ) => {
        try {
          if (!originalFile || !newFileName) return null;

          // Find the target folder (photo or idproof)
          let folder = await FileNode.findOne({
            name: folderName,
            type: "folder",
            parentId: null, // Root level folders
          });

          if (!folder) {
            // Create folder if it doesn't exist
            folder = await FileNode.create({
              name: folderName,
              type: "folder",
              parentId: null,
            });
            console.log(`📁 Created folder: ${folderName}`);
          }

          // Get file extension from original file
          const ext = path.extname(originalFile.originalname);
          const finalFileName = `${newFileName}${ext}`;

          // Create new file path
          const uploadsDir = path.join(__dirname, "../../uploads");
          const newFilePath = path.join(uploadsDir, finalFileName);

          // Copy/rename the uploaded file
          if (fs.existsSync(originalFile.path)) {
            fs.copyFileSync(originalFile.path, newFilePath);
            console.log(`📁 File copied to: ${finalFileName}`);
          }

          // Check if file node already exists in file manager
          const existingNode = await FileNode.findOne({
            name: finalFileName,
            parentId: folder._id,
          });

          if (!existingNode) {
            // Create file node in file manager
            await FileNode.create({
              name: finalFileName,
              type: "file",
              parentId: folder._id,
              url: `/uploads/${finalFileName}`,
              size: originalFile.size || 0,
              mimeType: originalFile.mimetype || "image/jpeg",
            });
            console.log(
              `📁 Added to file manager: ${finalFileName} in ${folderName}`,
            );
          }

          return finalFileName;
        } catch (error) {
          console.error("Sync to File Manager failed:", error);
          return null;
        }
      };

      // Handle visitor photo
      if (req.files.photo) {
        console.log("📸 NEW PHOTO UPLOADED:", req.files.photo[0].path);
        const photoFile = req.files.photo[0];

        // Always use Cloudinary URL if available, and store it properly in file manager
        if (
          photoFile.path &&
          (photoFile.path.includes("cloudinary") ||
            photoFile.path.startsWith("http"))
        ) {
          updateData.photo = photoFile.path; // Keep Cloudinary URL in visitor record

          // Add to file manager with Cloudinary URL (not local path)
          try {
            const { FileNode } = require("../models");
            let folder = await FileNode.findOne({
              name: "photo",
              type: "folder",
              parentId: null,
            });

            if (!folder) {
              folder = await FileNode.create({
                name: "photo",
                type: "folder",
                parentId: null,
              });
            }

            const ext = path.extname(photoFile.originalname) || ".jpg";
            const finalFileName = `${visitor.visitorId}${ext}`;

            // Update existing or create new
            const existingNode = await FileNode.findOne({
              name: finalFileName,
              parentId: folder._id,
            });

            if (existingNode) {
              // Update existing node with new Cloudinary URL
              await FileNode.findByIdAndUpdate(existingNode._id, {
                url: photoFile.path,
                size: photoFile.size || 0,
                mimeType: photoFile.mimetype || "image/jpeg",
              });
              console.log(
                `📁 Updated photo in file manager with Cloudinary URL: ${finalFileName} -> ${photoFile.path}`,
              );
            } else {
              // Create new node
              await FileNode.create({
                name: finalFileName,
                type: "file",
                parentId: folder._id,
                url: photoFile.path, // Store Cloudinary URL in file manager
                size: photoFile.size || 0,
                mimeType: photoFile.mimetype || "image/jpeg",
              });
              console.log(
                `📁 Added photo to file manager with Cloudinary URL: ${finalFileName} -> ${photoFile.path}`,
              );
            }
          } catch (error) {
            console.error("Error adding photo to file manager:", error);
          }
        } else {
          // Local file handling (fallback)
          const photoFileName = await syncToFileManager(
            photoFile,
            visitor.visitorId,
            "photo",
          );
          updateData.photo = photoFileName
            ? `/uploads/${photoFileName}`
            : photoFile.path;
        }
      }

      // Handle documents updates with file manager sync and Cloudinary support
      const existingDocs = visitor.documents || {};
      const newDocs = { ...existingDocs }; // Start with existing

      // Helper function to handle document with Cloudinary support
      const handleDocumentUpdate = async (fileArray, fileName, folderName) => {
        if (!fileArray || !fileArray[0]) return null;

        const file = fileArray[0];

        // If file is on Cloudinary, use that URL and add to file manager
        if (
          file.path &&
          (file.path.includes("cloudinary") || file.path.startsWith("http"))
        ) {
          try {
            const { FileNode } = require("../models");
            let folder = await FileNode.findOne({
              name: folderName,
              type: "folder",
              parentId: null,
            });

            if (!folder) {
              folder = await FileNode.create({
                name: folderName,
                type: "folder",
                parentId: null,
              });
            }

            const ext = path.extname(file.originalname) || ".jpg";
            const finalFileName = `${fileName}${ext}`;

            // Update existing or create new
            const existingNode = await FileNode.findOne({
              name: finalFileName,
              parentId: folder._id,
            });

            if (existingNode) {
              // Update existing node with new Cloudinary URL
              await FileNode.findByIdAndUpdate(existingNode._id, {
                url: file.path,
                size: file.size || 0,
                mimeType: file.mimetype || "image/jpeg",
              });
              console.log(
                `📁 Updated ${fileName} in file manager with Cloudinary URL`,
              );
            } else {
              // Create new node
              await FileNode.create({
                name: finalFileName,
                type: "file",
                parentId: folder._id,
                url: file.path, // Use Cloudinary URL
                size: file.size || 0,
                mimeType: file.mimetype || "image/jpeg",
              });
              console.log(
                `📁 Added ${fileName} to file manager with Cloudinary URL`,
              );
            }
          } catch (error) {
            console.error(`Error adding ${fileName} to file manager:`, error);
          }

          return file.path; // Return Cloudinary URL
        } else {
          // Local file handling
          const localFileName = await syncToFileManager(
            file,
            fileName,
            folderName,
          );
          return localFileName ? `/uploads/${localFileName}` : file.path;
        }
      };

      // Aadhar Front
      if (req.files.aadharFront) {
        newDocs.aadharFront = await handleDocumentUpdate(
          req.files.aadharFront,
          `aadhrFR_${visitor.visitorId}`,
          "idproof",
        );
      }

      // Aadhar Back
      if (req.files.aadharBack) {
        newDocs.aadharBack = await handleDocumentUpdate(
          req.files.aadharBack,
          `aadhrBK_${visitor.visitorId}`,
          "idproof",
        );
      }

      // PAN Front
      if (req.files.panFront) {
        newDocs.panFront = await handleDocumentUpdate(
          req.files.panFront,
          `PAN_${visitor.visitorId}`,
          "idproof",
        );
      }

      // PAN Back
      if (req.files.panBack) {
        newDocs.panBack = await handleDocumentUpdate(
          req.files.panBack,
          `PANBACK_${visitor.visitorId}`,
          "idproof",
        );
      }

      updateData.documents = newDocs;
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
      },
    );

    // Log print action if card printed flag was set in this update
    try {
      const printedNow = !visitor.isCardPrinted && updateData.isCardPrinted;
      if (printedNow) {
        await ActivityLog.create({
          user: req.user ? req.user.id : null,
          userModel: req.user ? "Employee" : "Admin", // Dynamic based on user type
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

      // Log general update activity
      if (req.user) {
        await ActivityLog.create({
          user: req.user.id,
          userModel: "Employee", // Specify that this is an Employee
          action: "UPDATE_VISITOR",
          module: "VISITOR",
          details: `Updated visitor ${updatedVisitor.name} (${updatedVisitor.visitorId})`,
          ipAddress: req.ip,
          metadata: {
            visitorId: updatedVisitor.visitorId,
            updatedBy: req.user.name,
            updatedFields: Object.keys(req.body),
          },
        });
      }
    } catch (logErr) {
      console.error("Failed to log activity:", logErr.message || logErr);
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

    console.log(`🗑️ Deleting visitor: ${visitor.visitorId} (${visitor.name})`);

    // Clean up file manager entries for this visitor
    try {
      const { FileNode } = require("../models");

      // Helper function to delete file from file manager by name pattern
      const deleteFileFromManager = async (fileName, folderName) => {
        try {
          // Find folder
          const folder = await FileNode.findOne({
            name: folderName,
            type: "folder",
            parentId: null,
          });

          if (folder) {
            console.log(`📁 Found ${folderName} folder: ${folder._id}`);

            // Try multiple search patterns for better matching
            const searchPatterns = [
              { name: fileName }, // Exact match
              { name: { $regex: new RegExp(`^${fileName}`, "i") } }, // Starts with (case insensitive)
              { name: { $regex: new RegExp(fileName, "i") } }, // Contains (case insensitive)
              {
                name: {
                  $regex: new RegExp(`${fileName}\\.(jpg|jpeg|png|pdf)$`, "i"),
                },
              }, // With common extensions
            ];

            let fileNode = null;
            for (const pattern of searchPatterns) {
              fileNode = await FileNode.findOne({
                ...pattern,
                parentId: folder._id,
                type: "file",
              });
              if (fileNode) {
                console.log(
                  `🔍 Found file with pattern: ${JSON.stringify(pattern)}`,
                );
                break;
              }
            }

            if (fileNode) {
              await FileNode.findByIdAndDelete(fileNode._id);
              console.log(
                `🗑️ Deleted from file manager: ${fileNode.name} from ${folderName}`,
              );
              return true;
            } else {
              console.log(
                `ℹ️ File not found in ${folderName} folder with any pattern: ${fileName}`,
              );

              // Debug: List all files in the folder
              const allFiles = await FileNode.find({
                parentId: folder._id,
                type: "file",
              }).select("name");
              console.log(
                `📋 All files in ${folderName}:`,
                allFiles.map((f) => f.name),
              );
            }
          } else {
            console.log(`⚠️ Folder not found: ${folderName}`);
          }
          return false;
        } catch (error) {
          console.error(`Error deleting ${fileName} from file manager:`, error);
          return false;
        }
      };

      // Delete visitor photo from file manager
      if (visitor.visitorId) {
        await deleteFileFromManager(visitor.visitorId, "photo");
      }

      // Delete visitor documents from file manager
      if (visitor.visitorId) {
        console.log(
          `🔍 Looking for ID proof documents for visitor: ${visitor.visitorId}`,
        );
        await deleteFileFromManager(`aadhrFR_${visitor.visitorId}`, "idproof");
        await deleteFileFromManager(`aadhrBK_${visitor.visitorId}`, "idproof");
        await deleteFileFromManager(`PAN_${visitor.visitorId}`, "idproof");
        await deleteFileFromManager(`PANBACK_${visitor.visitorId}`, "idproof");
      }

      console.log(
        `🧹 File manager cleanup completed for visitor: ${visitor.visitorId}`,
      );
    } catch (error) {
      console.error("Error during file manager cleanup:", error);
      // Continue with visitor deletion even if file cleanup fails
    }

    await Visitor.findByIdAndDelete(visitorId);

    console.log(`✅ Visitor deleted successfully: ${visitor.visitorId}`);

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

    console.log(`🗑️ Bulk deleting ${ids.length} visitors...`);

    // Get visitor details before deletion for file cleanup
    const visitors = await Visitor.find({
      _id: { $in: ids },
    }).select("visitorId name");

    console.log(`📋 Found ${visitors.length} visitors to delete`);

    // Clean up file manager entries for all visitors
    try {
      const { FileNode } = require("../models");

      // Helper function to delete file from file manager by name pattern
      const deleteFileFromManager = async (fileName, folderName) => {
        try {
          // Find folder
          const folder = await FileNode.findOne({
            name: folderName,
            type: "folder",
            parentId: null,
          });

          if (folder) {
            // Try multiple search patterns for better matching
            const searchPatterns = [
              { name: fileName }, // Exact match
              { name: { $regex: new RegExp(`^${fileName}`, "i") } }, // Starts with (case insensitive)
              { name: { $regex: new RegExp(fileName, "i") } }, // Contains (case insensitive)
              {
                name: {
                  $regex: new RegExp(`${fileName}\\.(jpg|jpeg|png|pdf)$`, "i"),
                },
              }, // With common extensions
            ];

            let fileNode = null;
            for (const pattern of searchPatterns) {
              fileNode = await FileNode.findOne({
                ...pattern,
                parentId: folder._id,
                type: "file",
              });
              if (fileNode) break;
            }

            if (fileNode) {
              await FileNode.findByIdAndDelete(fileNode._id);
              console.log(
                `🗑️ Bulk deleted from file manager: ${fileNode.name} from ${folderName}`,
              );
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error(`Error deleting ${fileName} from file manager:`, error);
          return false;
        }
      };

      // Delete files for each visitor
      for (const visitor of visitors) {
        if (visitor.visitorId) {
          // Delete visitor photo
          await deleteFileFromManager(visitor.visitorId, "photo");

          // Delete visitor documents
          await deleteFileFromManager(
            `aadhrFR_${visitor.visitorId}`,
            "idproof",
          );
          await deleteFileFromManager(
            `aadhrBK_${visitor.visitorId}`,
            "idproof",
          );
          await deleteFileFromManager(`PAN_${visitor.visitorId}`, "idproof");
          await deleteFileFromManager(
            `PANBACK_${visitor.visitorId}`,
            "idproof",
          );
        }
      }

      console.log(
        `🧹 Bulk file manager cleanup completed for ${visitors.length} visitors`,
      );
    } catch (error) {
      console.error("Error during bulk file manager cleanup:", error);
      // Continue with visitor deletion even if file cleanup fails
    }

    // Delete visitors from database
    const result = await Visitor.deleteMany({
      _id: {
        $in: ids,
      },
    });

    console.log(`✅ Bulk deleted ${result.deletedCount} visitors successfully`);

    res.status(200).json({
      message: "Visitors deleted successfully",
      success: true,
      deletedCount: result.deletedCount,
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
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
    const { visitorId, placeId } = req.body;

    // SAFEGUARDS
    const userName = req.user ? req.user.name : "Unknown User";
    console.log(
      `📷 Scan request by ${userName} for: ${visitorId} at place: ${placeId || "No place specified"}`,
    );

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

    // Resolve Category Name if category is an ID
    let categoryName = visitor.category || "General";
    if (visitor.category && visitor.category.match(/^[0-9a-fA-F]{24}$/)) {
      const cat = await Category.findById(visitor.category);
      if (cat) categoryName = cat.name;
    }

    // Validate place if provided
    let place = null;
    if (placeId) {
      const { Place } = require("../models");
      place = await Place.findById(placeId);
      if (!place) {
        return res.status(400).json({
          success: false,
          message: "Invalid place selected",
        });
      }

      // Check if employee is assigned to this place
      if (!place.assignedEmployees.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to scan at this place",
        });
      }
    }

    // Log Scan Activity
    if (req.user) {
      try {
        const activityData = {
          user: req.user.id,
          userModel: "Employee", // Specify that this is an Employee
          action: "SCAN_VISITOR",
          module: "SCANNER",
          details: `Scanned visitor ${visitor.name} (${visitor.visitorId})${place ? ` at ${place.name}` : ""}`,
          ipAddress: req.ip,
          metadata: {
            visitorId: visitor.visitorId,
            scannedBy: userName,
            ...(place && {
              placeId: place._id,
              placeName: place.name,
              placeCode: place.placeCode,
            }),
          },
        };

        await ActivityLog.create(activityData);
      } catch (logLimitError) {
        console.error("Failed to log scan activity:", logLimitError.message);
        // Non-blocking error
      }
    }

    res.status(200).json({
      success: true,
      message: "Visitor scanned successfully",
      data: {
        ...visitor.toObject(),
        category: categoryName, // Override with resolved category name
        scannedAt: place
          ? {
              id: place._id,
              name: place.name,
              code: place.placeCode,
            }
          : null,
      },
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
      return res
        .status(404)
        .json({ success: false, message: "Visitor not found" });
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
      .populate("user", "fullName emp_code emp_type") // Populate employee details
      .sort({ timestamp: -1 })
      .limit(500)
      .lean();

    // Format the logs with employee and place information
    const formattedLogs = logs.map((log) => ({
      ...log,
      employeeName: log.user?.fullName || "System",
      employeeCode: log.user?.emp_code || null,
      employeeType: log.user?.emp_type || null,
      placeName: log.metadata?.placeName || null,
      placeCode: log.metadata?.placeCode || null,
      actionType:
        log.action === "SCAN_VISITOR"
          ? "scan"
          : log.action === "UPDATE_VISITOR"
            ? "update"
            : log.action === "PRINT_VISITOR_CARD"
              ? "print"
              : "other",
    }));

    return res.status(200).json({
      success: true,
      message: "Visitor history fetched",
      data: formattedLogs,
    });
  } catch (error) {
    console.error("❌ Get Visitor History Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

// Get Employee Dashboard Stats
exports.getEmployeeDashboardStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name || req.user.fullName || "Unknown";

    // Get today's date in local timezone (India)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(
      `📊 Dashboard Stats Request for Employee: ${userName} (${userId})`,
    );
    console.log(`📅 Today's date range: ${today} to ${tomorrow}`);

    // 1. Count Total Visitors
    const totalVisitors = await Visitor.countDocuments({});

    // 2. Count My Scans Today (with fallback for old logs without userModel)
    const todayScans = await ActivityLog.countDocuments({
      user: userId,
      $or: [
        { userModel: "Employee" }, // New logs with userModel
        { userModel: { $exists: false } }, // Old logs without userModel (fallback)
      ],
      action: "SCAN_VISITOR",
      timestamp: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    console.log(`🔍 Today's scans for ${userName}: ${todayScans}`);

    // Debug: Get all scan activities for this user today
    const debugScans = await ActivityLog.find({
      user: userId,
      $or: [{ userModel: "Employee" }, { userModel: { $exists: false } }],
      action: "SCAN_VISITOR",
      timestamp: {
        $gte: today,
        $lt: tomorrow,
      },
    }).select("timestamp details action userModel");

    console.log(
      `🔍 Debug - All scans today:`,
      debugScans.map((s) => ({
        time: s.timestamp,
        details: s.details,
        action: s.action,
        userModel: s.userModel || "legacy",
      })),
    );

    // 3. Get Recent Activities (with fallback for old logs)
    const recentActivities = await ActivityLog.find({
      user: userId,
      $or: [
        { userModel: "Employee" }, // New logs with userModel
        { userModel: { $exists: false } }, // Old logs without userModel (fallback)
      ],
    })
      .sort({ timestamp: -1 }) // Use timestamp for sorting
      .limit(10)
      .populate("user", "fullName name emp_code"); // Populate employee details

    // Format activities for frontend
    const formattedActivities = recentActivities.map((log) => ({
      id: log._id,
      action: log.details, // "Scanned visitor John Doe..."
      time: new Date(log.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type:
        log.action === "SCAN_VISITOR"
          ? "scan"
          : log.action === "UPDATE_VISITOR"
            ? "update"
            : log.action === "PRINT_VISITOR_CARD"
              ? "print"
              : log.action === "VIEW_VISITOR"
                ? "view"
                : log.action === "CREATE_VISITOR"
                  ? "register"
                  : "other",
      date: new Date(log.timestamp).toLocaleDateString(),
      details: log.details || `${log.action} performed`,
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
// Get visitor activity history
exports.getVisitorActivityHistory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find visitor first to get visitorId
    let query = { _id: id };
    if (id.match(/^[A-Z0-9]+$/)) {
      query = { visitorId: id };
    }

    const visitor = await Visitor.findOne(query);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    // Get activity logs for this visitor
    const activities = await ActivityLog.find({
      $or: [
        { "metadata.visitorId": visitor.visitorId },
        { details: { $regex: visitor.visitorId, $options: "i" } },
      ],
    })
      .populate("user", "fullName emp_code")
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedActivities = activities.map((log) => ({
      id: log._id,
      action: log.details,
      type:
        log.action === "SCAN_VISITOR"
          ? "scan"
          : log.action === "UPDATE_VISITOR"
            ? "update"
            : "view",
      employeeName: log.user?.fullName || "System",
      employeeCode: log.user?.emp_code,
      timestamp: log.createdAt,
      ipAddress: log.ipAddress,
    }));

    res.status(200).json({
      success: true,
      data: formattedActivities,
    });
  } catch (error) {
    console.error("❌ Activity History Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity history",
      error: error.message,
    });
  }
});

// Get employee scan history
exports.getEmployeeScanHistory = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent scans by this employee
    const scanLogs = await ActivityLog.find({
      user: userId,
      action: "SCAN_VISITOR",
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const scanHistory = await Promise.all(
      scanLogs.map(async (log) => {
        const visitorId = log.metadata?.visitorId;
        if (!visitorId) return null;

        const visitor = await Visitor.findOne({ visitorId }).select(
          "name visitorId companyName photo",
        );

        return {
          scannedAt: log.createdAt,
          visitor: visitor || {
            name: "Unknown Visitor",
            visitorId: visitorId,
            companyName: "Unknown Company",
          },
        };
      }),
    );

    // Filter out null entries
    const validHistory = scanHistory.filter((item) => item !== null);

    res.status(200).json({
      success: true,
      data: validHistory,
    });
  } catch (error) {
    console.error("❌ Scan History Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching scan history",
      error: error.message,
    });
  }
});
// Log visitor view activity
exports.logVisitorView = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find visitor first
    let query = { _id: id };
    if (id.match(/^[A-Z0-9]+$/)) {
      query = { visitorId: id };
    }

    const visitor = await Visitor.findOne(query);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    // Log view activity
    if (req.user) {
      try {
        await ActivityLog.create({
          user: req.user.id,
          userModel: "Employee", // Specify that this is an Employee
          action: "VIEW_VISITOR",
          module: "VISITOR",
          details: `Viewed visitor ${visitor.name} (${visitor.visitorId})`,
          ipAddress: req.ip,
          metadata: {
            visitorId: visitor.visitorId,
            viewedBy: req.user.name,
          },
        });
      } catch (logError) {
        console.error("Failed to log view activity:", logError.message);
        // Non-blocking error
      }
    }

    res.status(200).json({
      success: true,
      message: "View logged successfully",
    });
  } catch (error) {
    console.error("❌ Log View Error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging view",
      error: error.message,
    });
  }
});
