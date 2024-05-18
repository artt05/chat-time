const express = require("express");
const { resizeAndCompressImage } = require("../uploads/storage");
const {
  createPost,
  createPostView,
  likePost,
  deletePost,
} = require("../controllers/post.controller");
const {
  protectRoute,
  validateUpload,
  validateUpload2,
} = require("../auth/protect");
const { upload } = require("../uploads/storage");
const router = express.Router();

router.get("/post", protectRoute, createPostView);
router.post(
  "/post",
  protectRoute,
  upload,
  (req, res, next) => {
    // Call your custom uploadToS3 function
    resizeAndCompressImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )
      .then((fileLocation) => {
        // Attach fileLocation to req object
        req.fileLocation = fileLocation;
        // Call the next middleware or handler
        next();
      })
      .catch((error) => {
        // Handle uploadToS3 errors
        next(error);
      });
  },

  validateUpload,
  validateUpload2,
  createPost
);
router.put("/post/:postId/like", protectRoute, likePost);
router.get("/deletepost/:postId", protectRoute, deletePost);

module.exports = router;
