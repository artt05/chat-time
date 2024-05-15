const express = require("express");
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
const { upload, uploadToS3 } = require("../uploads/storage"); // Import the combined middleware and function

const router = express.Router();

router.get("/post", protectRoute, createPostView);

router.post(
  "/post",
  protectRoute,
  upload,
  async (req, res, next) => {
    try {
      await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      ); // Upload file to S3
      next();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal server error.");
    }
  },
  validateUpload,
  validateUpload2,
  createPost
);

router.put("/post/:postId/like", protectRoute, likePost);
router.get("/deletepost/:postId", protectRoute, deletePost);

module.exports = router;
