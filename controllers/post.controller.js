const Post = require("../models/post.model");
const User = require("../models/user.model");
const multer = require("multer");
const fs = require("fs");

const createPostView = (req, res) => {
  res.render("_partial_views/create-post");
};
const createProfileView = (req, res) => {
  res.render("_partial_views/profile-picture");
};
const getPost = (req, res) => {
  const postId = req.params.postId;
  console.log("postId", postId);
  Post.findById(postId)
    .populate("user", "name")
    .populate("comments._user", "name")
    .then((post) => {
      if (!post) {
        return res.status(404).json({ error: "Post not found." });
      }

      res.json({ post });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while finding the post." });
    });
};
// Create a new post
const createPost = async (req, res) => {
  console.log("filename", req.fileLocation);

  const { content } = req.body;
  console.log("content", content);
  const userId = req.user.id; // Assuming the authenticated user's ID is stored in req.user.id
  const user = await User.findById(userId);
  const newPost = new Post({
    content,
    user: userId,
    image: req.file ? `${req.fileLocation}` : null,
    type: req.file ? req.file.mimetype : null,
  });

  newPost
    .save()
    .then((savedPost) => {
      res.status(201).json({ post: savedPost });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
};
const createProfile = async (req, res) => {
  console.log("filename", req.fileLocation);

  const userId = req.user.id; // Assuming the authenticated user's ID is stored in req.user.id
  const user = await User.findById(userId);
  user.profilePicture = req.fileLocation;

  user.save().then((savedUser) => {
    res.status(201).json({ user: savedUser });
  });
};

// Like a post
const likePost = (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ error: "Post not found." });
      }

      const liked = post.likes.includes(userId);

      if (liked) {
        // Unlike the post
        post.likes.pull(userId);
      } else {
        // Like the post
        post.likes.push(userId);
      }

      post
        .save()
        .then((updatedPost) => {
          res.json({ liked: !liked, post }); // Return the updated like status
        })
        .catch((error) => {
          res
            .status(500)
            .json({ error: "An error occurred while updating the post." });
        });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while finding the post." });
    });
};
function CommentPost(req, res) {
  const postId = req.params.postId;
  const userId = req.user.id;
  const { comment } = req.body.comment;

  const Post = Post.findById(postId);
  if (!Post) {
    return res.status(404).json({ error: "Post not found." });
  }
  if (!text) {
    return res.status(400).json({ error: "Comment text is required." });
  }
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized user." });
  }
  Post.comments.push({
    _user: userId,
    comment: comment,
  });
  Post.save()
    .then((updatedPost) => {
      res.json({ post: updatedPost });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while updating the post." });
    });
}

function deletePost(req, res) {
  const postId = req.params.postId;
  const userId = req.user.id;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.redirect(
          `/index?error=` +
            encodeURIComponent("The Post doesnt exist") +
            `&color=` +
            encodeURIComponent("danger")
        );
      }
      if (!postId) {
        return res.redirect(
          `/index?error=` +
            encodeURIComponent("The Post doesnt exist") +
            `&color=` +
            encodeURIComponent("danger")
        );
      }

      if (post.user != userId) {
        return res.redirect(
          `/index?error=` +
            encodeURIComponent("You dont have access for this action") +
            `&color=` +
            encodeURIComponent("danger")
        );
      }
      fs.unlink(post.image, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      post
        .delete()
        .then((updatedPost) => {
          res.redirect(
            `/index?error=` +
              encodeURIComponent("The Post was deleted") +
              `&color=` +
              encodeURIComponent("success")
          );
        })
        .catch((error) => {
          res
            .status(500)
            .json({ error: "An error occurred while updating the post." });
        });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while finding the post." });
    });
}
function CommentOnPost(req, res) {
  const postId = req.params.postId;
  const userId = req.user.id;
  const comment = req.body.comment;
  console.log("comment", comment);

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ error: "Post not found." });
      }

      post.comments.push({
        _user: userId,
        comment: comment,
      });

      post
        .save()
        .then((updatedPost) => {
          res.json({ post: updatedPost });
        })
        .catch((error) => {
          res
            .status(500)
            .json({ error: "An error occurred while updating the post." });
        });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while finding the post." });
    });
}

module.exports = {
  CommentPost,
  createPost,
  createPostView,
  likePost,
  deletePost,
  getPost,
  CommentOnPost,
  createProfileView,
  createProfile,
};
