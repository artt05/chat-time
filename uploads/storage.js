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

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();
const bucketName = process.env.AWS_BUCKET_NAME;

// Configure Multer for file uploads (without storing locally)
const storage = multer.memoryStorage(); // Use memory storage for file uploads
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

// Function to resize and compress image
const resizeAndCompressImage = async (fileBuffer, fileName, fileType) => {
  const resizedImageBuffer = await sharp(fileBuffer)
    .resize({ width: 500, height: 700 }) // Set the desired width and height
    .toBuffer(); // Convert the image to buffer after resizing

  return uploadToS3(resizedImageBuffer, fileName, fileType); // Upload the resized image to S3
};

// Function to upload file buffer to S3
const uploadToS3 = function (fileBuffer, fileName, fileType) {
  return new Promise((resolve, reject) => {
    if (!fileBuffer || !fileName || !fileType) {
      return reject("Invalid file data provided.");
    }

    const params = {
      Bucket: bucketName,
      Key: `${Date.now()}${path.extname(fileName)}`, // Unique filename
      Body: fileBuffer,
      ContentType: fileType,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error("Error uploading file:", err);
        reject(err);
      } else {
        console.log(
          "File uploaded successfully. File location:",
          data.Location
        );
        resolve(data.Location); // Resolve with file location
      }
    });
  });
};

module.exports = { upload, resizeAndCompressImage };
