const { Visitor, ActivityLog } = require("../models");
const bwipjs = require("bwip-js");

// Generate barcode for visitor (same as old system)
exports.generateBarcode = async (req, res) => {
  try {
    const visitorId = req.params.visitorId;

    if (!visitorId) {
      return res.status(400).json({
        error: "VisitorId parameter is missing or undefined",
        success: false,
      });
    }

    const visitor = await Visitor.findOne({
      visitorId: visitorId,
    });

    if (!visitor) {
      return res.status(404).json({
        error: "Visitor not found",
        success: false,
      });
    }

    // Generate barcode using bwip-js
    bwipjs.toBuffer(
      {
        bcid: "code128", // Barcode type
        text: visitor.visitorId, // Visitor ID (e.g., CO1001)
        scale: 3,
        height: 10,
        includetext: true, // Show text below barcode
      },
      async (err, png) => {
        if (err) {
          console.error("Barcode generation error:", err);
          return res.status(500).json({
            error: "Error generating barcode",
            success: false,
          });
        }

        // Log the barcode request (non-blocking)
        try {
          await ActivityLog.create({
            user: req.user ? req.user.id : null,
            action: "REQUEST_BARCODE",
            module: "VISITOR",
            details: `Generated barcode for ${visitor.visitorId}`,
            ipAddress: req.ip,
            metadata: {
              visitorId: visitor.visitorId,
              requestedBy: req.user ? req.user.name : "public",
            },
          });
        } catch (logErr) {
          console.error("Failed to log barcode request:", logErr.message || logErr);
        }

        res.setHeader("Content-Type", "image/png");
        res.status(200).send(png);
      }
    );
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      success: false,
    });
  }
};

// Get visitor info with barcode data (for card generation)
exports.getVisitorCard = async (req, res) => {
  try {
    const visitorId = req.params.visitorId;

    if (!visitorId) {
      return res.status(400).json({
        error: "VisitorId parameter is missing",
        success: false,
      });
    }

    const visitor = await Visitor.findOne({
      visitorId: visitorId,
    });

    if (!visitor) {
      return res.status(404).json({
        error: "Visitor not found",
        success: false,
      });
    }

    // Return visitor data for card generation
    res.status(200).json({
      message: "Visitor card data retrieved",
      success: true,
      data: {
        visitorId: visitor.visitorId,
        name: visitor.name,
        companyName: visitor.companyName,
        category: visitor.category,
        email: visitor.email,
        contact: visitor.contact,
        photo: visitor.photo,
        barcodeUrl: `/api/v1/barcode/${visitor.visitorId}`,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      success: false,
    });
  }
};

module.exports = exports;
