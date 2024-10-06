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
  createProfileView,
  createProfile,
} = require("../controllers/post.controller");
const {
  protectRoute,
  validateUpload,
  validateUpload2,
  validateUpload3,
} = require("../auth/protect");
const { upload, uploadd } = require("../uploads/storage");
const { create } = require("../models/post.model");
const router = express.Router();
router.get("/post/:postId", getPost);
router.get("/post", protectRoute, createPostView);
router.get("/post-profile", protectRoute, createProfileView);

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
router.post(
  "/post-profile-upload",
  protectRoute,
  uploadd,
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
  validateUpload3,
  createProfile
);
router.put("/post/:postId/like", protectRoute, likePost);
router.get("/post/:postId/comment", protectRoute, CommentPost);
router.get("/deletepost/:postId", protectRoute, deletePost);
router.post("/post/:postId/comment", CommentOnPost);

module.exports = router;
