const multer = require("multer");
const AWS = require("aws-sdk");
const path = require("path");
const sharp = require("sharp"); // Import sharp for image compression

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "video/mp4",
  "audio/mp3",
];
const allowedMimeTypesProfile = ["image/jpeg", "image/jpg", "image/png"];

// Configure AWS SDK

const bucketName = process.env.AWS_BUCKET_NAME;

// Configure Multer for file uploads (without storing locally)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/uploads"); // Save files to 'uploads' folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext); // Generate unique filename
  },
}); // Use memory storage for file uploads
const fileFilter = function (req, file, cb) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    // Continue with the upload
    cb(null, true);
  } else {
    // Reject the file and redirect to a specific route
    req.fileValidationError =
      "Invalid file type. Allowed types are jpeg, jpg, png, mp4, mp3.";
    return cb(null, false);
  }
};

// Multer middleware for file upload
const upload = multer({ storage: storage, fileFilter: fileFilter }).single(
  "image"
);
const storagee = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile-picture"); // Save files to 'uploads' folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext); // Generate unique filename
  },
}); // Use memory storage for file uploads
const fileFilterr = function (req, file, cb) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    console.log("arti");
    cb(null, true);
  } else {
    // Reject the file and redirect to a specific route
    req.fileValidationError =
      "Invalid file type. Allowed types are jpeg, jpg, png.";
    return cb(null, false);
  }
};

// Multer middleware for file upload
const uploadd = multer({ storage: storagee, fileFilter: fileFilterr }).single(
  "image"
);

// Function to resize and compress image

// Function to upload file buffer to S3

module.exports = { upload, uploadd };
