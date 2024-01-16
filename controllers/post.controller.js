const Post = require("../models/post.model");
const User = require("../models/user.model");
const multer = require("multer");

const createPostView = (req, res) => {
  res.render("_partial_views/create-post");
};
// Create a new post
const createPost = async (req, res) => {
  const { content } = req.body;

  const userId = req.user.id; // Assuming the authenticated user's ID is stored in req.user.id
  console.log("akik", req.file);
  const user = await User.findById(userId);
  console.log(req.body);
  const newPost = new Post({
    content,
    user: userId,
    image: req.file ? `${req.file.filename}` : null,
    type: req.file ? req.file.mimetype : null,
  });

  newPost
    .save()
    .then((savedPost) => {
      res.redirect("/index");
    })
    .catch((error) => {
      res.status(500).json({ error: error });
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
function deletePost(req, res) {
  const postId = req.params.postId;
  const userId = req.user.id;
  console.log(postId, userId);
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

module.exports = {
  createPost,
  createPostView,
  likePost,
  deletePost,
};
