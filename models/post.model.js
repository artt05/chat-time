const { compare } = require("bcryptjs");
const mongoose = require("mongoose");

// Define the Post schema
const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    type: String,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      comment: String,
      _user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  type: {
    type: String,
  },
});

// Create the Post model
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
