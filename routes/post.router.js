const express = require("express");
const { resizeAndCompressImage } = require("../uploads/storage");
const {
  createPost,
  createPostView,
  likePost,
  CommentPost,
  deletePost,
  getPost,
  CommentOnPost,
} = require("../controllers/post.controller");
const {
  protectRoute,
  validateUpload,
  validateUpload2,
} = require("../auth/protect");
const { upload } = require("../uploads/storage");
const router = express.Router();
router.get("/post/:postId", getPost);
router.get("/post", protectRoute, createPostView);
router.post(
  "/post",
  protectRoute,
  upload,
  (req, res, next) => {
    if (req.fileValidationError) {
      return res.status(400).send(req.fileValidationError);
    }
    if (req.file) {
      req.fileLocation = req.file.path; // Attach file location to req object
    }
    next();
  },
  validateUpload,
  validateUpload2,
  createPost
);
router.put("/post/:postId/like", protectRoute, likePost);
router.get("/post/:postId/comment", protectRoute, CommentPost);
router.get("/deletepost/:postId", protectRoute, deletePost);
router.post("/post/:postId/comment", CommentOnPost);

module.exports = router;
