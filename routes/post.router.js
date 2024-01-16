const express = require("express");
const {
  createPost,
  createPostView,
  likePost,
} = require("../controllers/post.controller");
const { protectRoute } = require("../auth/protect");
const upload = require("../uploads/storage");
const router = express.Router();

router.get("/post", protectRoute, createPostView);
router.post(
  "/post",
  protectRoute,
  protectRoute,
  upload.single("image"),
  createPost
);
router.put("/post/:postId/like", protectRoute, likePost);

module.exports = router;
