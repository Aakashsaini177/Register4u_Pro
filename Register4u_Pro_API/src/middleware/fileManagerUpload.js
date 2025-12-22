const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "register4u_pro/files", // Dedicated folder for file manager
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "docx", "xlsx"],
    resource_type: "auto", // Handle raw files like docs/excel
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images and docs
  // Expanded list for File Manager utility
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.ms-excel",
    "text/csv",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Making it permissive for file manager - log warning but maybe allow?
    // Sticking to strict for now to avoid issues
    console.warn(`Attempted upload of unsupported type: ${file.mimetype}`);
    // Actually, for file manager, let's allow everything that Cloudinary supports as raw/image
    cb(null, true);
  }
};

const fileManagerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = fileManagerUpload;
