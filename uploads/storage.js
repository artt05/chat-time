const express = require("express");
const path = require("path");
const multer = require("multer");

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "video/mp4",
  "audio/mp3",
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/uploads/"); // Specify the directory where you want to store uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a unique name
  },
});
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
const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = upload;
