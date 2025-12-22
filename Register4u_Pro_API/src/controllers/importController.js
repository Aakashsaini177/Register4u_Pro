const { Visitor, Category, FileNode } = require("../models");
const XLSX = require("xlsx");
const fs = require("fs");
const { asyncHandler } = require("../middleware/errorHandler");

// Helper to find or create category
async function getCategoryId(categoryName) {
  if (!categoryName) return null;

  // Case insensitive regex search
  let category = await Category.findOne({
    category: { $regex: new RegExp(`^${categoryName}$`, "i") },
  });

  if (!category) {
    // Optional: Create if not exists, or return null?
    // Let's create it to be safe and ensure data isn't lost
    category = await Category.create({ category: categoryName });
  }
  return category._id;
}

exports.importVisitors = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const results = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    results.total = jsonData.length;

    // Cache the "photo" folder ID for efficient lookups
    const photoFolder = await FileNode.findOne({
      name: "photo",
      parentId: null,
      type: "folder",
    });

    for (const row of jsonData) {
      try {
        // 1. Mandatory Fields Check
        const name = row["Name"];

        // If mandatory missing
        if (!name) {
          // Maybe skip or error? Let's error
          results.failed++;
          results.errors.push(`Missing Name in row: ${JSON.stringify(row)}`);
          continue;
        }

        let visitorId = row["Visitor ID"];

        // 2. Resolve Category & Prefix
        const categoryName = row["Category"] || "General";
        const categoryId = await getCategoryId(categoryName);

        // 3. ID Generation (If missing)
        if (!visitorId) {
          const catPrefix = categoryName
            .replace(/\s/g, "")
            .substring(0, 2)
            .toUpperCase();
          const lastVisitor = await Visitor.findOne({
            visitorId: new RegExp(`^${catPrefix}`),
          }).sort({ visitorId: -1 });
          let nextNumber = 1001;
          if (lastVisitor && lastVisitor.visitorId) {
            const match = lastVisitor.visitorId.match(/\d+$/);
            if (match) nextNumber = parseInt(match[0]) + 1;
          }
          visitorId = `${catPrefix}${nextNumber}`;

          // Check collision just in case (loop until free? or just +1)
          while (await Visitor.findOne({ visitorId })) {
            nextNumber++;
            visitorId = `${catPrefix}${nextNumber}`;
          }
        } else {
          // User provided ID - Check Duplicate
          const existing = await Visitor.findOne({ visitorId });
          if (existing) {
            results.skipped++;
            continue;
          }
        }

        // 4. Resolve Photo from File Manager
        let photoUrl = row["Photo"] || row["photo"] || ""; // Use provided URL if any
        if (!photoUrl && photoFolder) {
          // Look for exact ID match .jpg/png/jpeg
          // We can use regex to match name starting with ID
          const photoNode = await FileNode.findOne({
            parentId: photoFolder._id,
            name: {
              $regex: new RegExp(`^${visitorId}\\.(jpg|jpeg|png)$`, "i"),
            },
          });

          if (photoNode) {
            photoUrl = photoNode.url; // This should be the Cloudinary URL
            // console.log(`📸 Found photo for ${visitorId}: ${photoUrl}`);
          }
        }

        // 5. Create Visitor
        await Visitor.create({
          visitorId: String(visitorId),
          name: name,
          companyName: row["Company"] || row["Company Name"], // Mapped to companyName
          category: categoryId, // Storing ID
          contact: row["Contact"] ? String(row["Contact"]) : undefined, // Mapped to contact
          email: row["Email"],
          city: row["City"],
          state: row["State"],
          country: row["Country"],
          pincode: row["Pincode"] ? String(row["Pincode"]) : undefined,
          address: row["Address"],
          gender: row["Gender"],
          profession: row["Profession"],
          ticket: row["Ticket No"] || row["Ticket"],

          photo: photoUrl,
          status: "registered", // Default import status
          registrationSource: "BULK_IMPORT",
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Error processing ${row["Name"]}: ${error.message}`
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Import processing complete",
      data: results,
    });
  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({ success: false, message: "Failed to process file" });
  } finally {
    // Cleanup uploaded file
    try {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (err) {
      console.error("Failed to delete temp file:", err);
    }
  }
});
