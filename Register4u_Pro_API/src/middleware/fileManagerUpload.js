const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

console.log("📁 Upload directory:", uploadDir);

// Configure storage for file manager uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("📁 Multer destination called for:", file.originalname);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    console.log("📁 Multer filename called for:", file.originalname);
    // Create unique filename: file-timestamp-random.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = "file-" + uniqueSuffix + path.extname(file.originalname);
    console.log("📁 Generated filename:", filename);
    cb(null, filename);
  },
});

// Simplified file filter - allow all files for now
const fileFilter = (req, file, cb) => {
  console.log("📁 File filter called for:", file.originalname, file.mimetype);
  cb(null, true); // Allow all files for debugging
};

const fileManagerUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

module.exports = fileManagerUpload;