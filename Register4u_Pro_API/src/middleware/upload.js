const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "register4u_pro", // Cloudinary folder name
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional: Resize on upload
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images and pdfs
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
