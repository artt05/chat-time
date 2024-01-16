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
const upload = require("../uploads/storage");
const router = express.Router();

router.get("/post", protectRoute, createPostView);
router.post(
  "/post",
  protectRoute,
  upload.single("image"),
  validateUpload,
  validateUpload2,
  createPost
);
router.put("/post/:postId/like", protectRoute, likePost);
router.get("/deletepost/:postId", protectRoute, deletePost);

module.exports = router;
