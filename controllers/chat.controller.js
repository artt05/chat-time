const User = require("../models/user.model");
const Post = require("../models/post.model");
const Message = require("../models/message.model");

const ObjectId = require("mongodb").ObjectId;
const indexView = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    Post.find()
      .sort({ _id: -1 })
      .populate("user", "name")
      .exec()
      .then((posts) => {
        res.render("index", { posts, user });
      })
      .catch((error) => {
        res
          .status(500)
          .json({ error: "An error occurred while retrieving posts." });
      });
  } catch (e) {
    res.json(e);
  }
};
const searchView = async (req, res) => {
  try {
    const users = await User.find({ name: { $regex: `^${req.query.name}$` } });

    const senderId = req.user._id;

    for (const user of users) {
      const hasSent = user.friendRequests.some((friendRequest) => {
        return friendRequest.toString() === senderId.toString();
      });
      user.isSent = hasSent;
    }

    res.render("_partial_views/search-results", {
      users,
      currentUser: req.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
const sendMessage = async (req, res) => {
  const { message } = req.body;
  console.log("message", message);
  const reciverId = req.params.id;
  const senderId = req.user._id;
  console.log("reciverId", reciverId);
  console.log("senderId", senderId);

  try {
    const newMessage = new Message({
      message: message,
      senderId: senderId,
      reciverId: reciverId,
    });

    await newMessage.validate(); // Manually validate the message

    await newMessage.save();

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Handle validation errors
      const validationErrors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));

      return res
        .status(400)
        .json({ error: "Validation failed", validationErrors });
    }

    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const sendRequest = async (req, res) => {
  const userId = req.params.id;
  const senderId = req.user._id;
  let isUnique = true;

  try {
    const recipient = await User.findById(userId);
    const sender = await User.findById(ObjectId(senderId).toString());

    recipient.friendRequests.forEach((firendRequest) => {
      if (firendRequest.toString() === sender._id.toString()) {
        isUnique = false;
        return;
      }
    });

    if (isUnique) {
      recipient.friendRequests.push(sender);
      await recipient.save();

      const data = {
        message: "Friend request sent successfully!",
        isFriendRequestSent: true,
      };
      const posts = await Post.find({ user: req.user._id });

      res.render("index", { data, user: req.user, posts });
    } else {
      const data = {
        message: "You have already sent a friend request to this user.",
        isFriendRequestSent: false,
      };
      res.render("index", { data });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const friendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friendRequests", [
      "name",
      "email",
    ]);

    res.render("_partial_views/friend-requests", { user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
const chatView = async (req, res) => {
  try {
    console.log("req.params.id", req.params.id);
    console.log("req.user._id", req.user._id);
    const receivedMessages = await Message.find({
      reciverId: req.user._id,
      senderId: req.params.id,
    });
    const sentMessages = await Message.find({
      senderId: req.user._id,
      reciverId: req.params.id,
    });
    const user = await User.findById(req.params.id);
    const UserId = req.params.id;
    res.render("_partial_views/chat-view", {
      user,
      UserId,
      sentMessages,
      receivedMessages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
const allFriendsView = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends", [
      "name",
      "email",
    ]);

    res.render("_partial_views/friends", { friends: user.friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const acceptRequest = async (req, res) => {
  const userId = req.user._id;
  const friendId = req.params.id;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add friend to the friends array of the accepting user
    user.friends.push(friend._id);
    await user.save();

    // Remove friend request from the friendRequests array of the accepting user
    user.friendRequests = user.friendRequests.filter(
      (request) => request.toString() !== friend._id.toString()
    );
    await user.save();

    // Add the accepting user to the friends array of the requesting user
    friend.friends.push(user._id);
    await friend.save();

    res.redirect("/users/friends");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const user = await User.findById(req.user._id).populate("friendRequests");

    // Check if the request exists
    const requestExists = user.friendRequests.some((request) =>
      request._id.equals(requestId)
    );
    if (!requestExists) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Remove the request from the user's friendRequests array
    user.friendRequests.pull(requestId);
    await user.save();

    res.redirect("/users/friend-requests");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  indexView,
  searchView,
  sendRequest,
  acceptRequest,
  friendRequests,
  allFriendsView,
  rejectRequest,
  sendMessage,
  chatView,
};
