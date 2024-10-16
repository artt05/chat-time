const User = require("../models/user.model");
const Post = require("../models/post.model");
const Message = require("../models/message.model");

const ObjectId = require("mongodb").ObjectId;
const indexView = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    const page = "index";
    Post.find()
      .sort({ _id: -1 })
      .populate("user", "name profilePicture")
      .exec()
      .then((posts) => {
        res.render("index", { posts, user, page });
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
    const user = await User.findById(req.user._id);
    const users = await User.find({ name: { $regex: `^${req.query.name}$` } });
    const query = req.query.name;
    console.log("art", query);
    const senderId = req.user._id;

    for (const user of users) {
      const hasSent = user.friendRequests.some((friendRequest) => {
        return friendRequest.toString() === senderId.toString();
      });
      user.isSent = hasSent;
    }

    res.render("_partial_views/search-results", {
      user,
      users,
      currentUser: req.user,
      query,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
const sendMessage = async (req, res) => {
  const { message } = req.body;
  const reciverId = req.params.id;
  const senderId = req.user._id;

  try {
    const newMessage = new Message({
      message: message,
      senderId: senderId,
      reciverId: reciverId,
    });

    await newMessage.validate(); // Manually validate the message

    await newMessage.save();

    res.redirect(`/chat/${reciverId}`);
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

      res.redirect(
        `/search?name=${recipient.name}&error=` +
          encodeURIComponent("The request was sent successfully!") +
          `&color=` +
          encodeURIComponent("success")
      );
    } else {
      const data = {
        message: "You have already sent a friend request to this user.",
        isFriendRequestSent: false,
      };
      res.redirect(
        `/search?name=${recipient.name}&error=` +
          encodeURIComponent(
            "You have already sent a friend request to this user."
          ) +
          `&color=` +
          encodeURIComponent("danger")
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
const scrollToBottom = () => {
  const chat = document.querySelector(".chat");
  chat.scrollTop = chat.scrollHeight;
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
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();

    // If it's today, show only the time
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return `${date.getHours()}:${
        (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()
      }`;
    }

    // If it's not today but this month, show only the day and time
    if (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return `${date.getDate()} ${date.getHours()}:${
        (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()
      }`;
    }

    // If it's not this month but this year, show only the month, day, and time
    if (date.getFullYear() === now.getFullYear()) {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${
        monthNames[date.getMonth()]
      } ${date.getDate()}, ${date.getHours()}:${
        (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()
      }`;
    }

    // If it's not this year, show the full date
    return `${date.getFullYear()}-${
      (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1)
    }-${
      (date.getDate() < 10 ? "0" : "") + date.getDate()
    } - ${date.getHours()}:${
      (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()
    }`;
  }

  try {
    const receivedMessages = await Message.find({
      reciverId: req.user._id,
      senderId: req.params.id,
    });
    const sentMessages = await Message.find({
      senderId: req.user._id,
      reciverId: req.params.id,
    });
    const messages = await Message.find();
    const sortedMessages = messages
      .map((message) => ({
        message: message.message,
        timestamp: formatTimestamp(message._id.getTimestamp()),
        senderId: message.senderId,
        reciverId: message.reciverId,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Corrected sorting
    const user = await User.findById(req.user._id);
    const user2 = await User.findById(req.params.id);
    const user1 = req.user.id;
    const UserId = req.params.id;
    res.render("_partial_views/chat-view", {
      user,
      user1,
      user2,
      UserId,
      sentMessages,
      receivedMessages,
      messages,
      sortedMessages,
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

    res.render("_partial_views/friends", { friends: user.friends, user });
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
    if (!user.friends.includes(friend._id)) {
      user.friends.push(friend._id);
      await user.save();
    } else {
      return res.status(404).json({ error: "User already exists" });
    }

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
async function removeFriend(req, res) {
  const friendId = req.params.id;
  const userId = req.user.id;
  const user = await User.findById(userId).populate("friends");
  const friend = await User.findById(friendId).populate("friends");

  if (!user || !friend) {
    return res.status(404).json({ error: "User not found" });
  }
  const friendExists = user.friends.some((friends) =>
    friends._id.equals(friendId)
  );
  const otherfriendExists = friend.friends.some((friends) =>
    friends._id.equals(userId)
  );
  if (!friendExists || !otherfriendExists) {
    return res.status(404).json({ error: "Friend not found" });
  } else {
    user.friends.pull(friendId);
    friend.friends.pull(userId);
    await user.save();
    await friend.save();
    res.redirect("/users/friends");
  }
}
const profileView = async (req, res) => {
  const userId = req.user._id;
  console.log(userId);
  const user = await User.findById(userId);
  console.log(user);
  const userPosts = await Post.find({ user: userId });
  res.render("_partial_views/profile-view", { userId, user, userPosts });
};
function getUserById(req, res) {
  const userId = req.params.id;
  console.log(userId);
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      return res.json({ user });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while finding the user." });
    });
}
const thisUser = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  res.json(user);
};
async function IdProfileView(req, res) {
  const user = await User.findById(req.user._id);
  const userId = req.params.id;
  const userPosts = await Post.find({ user: userId });
  User.findById(userId)
    .then((user1) => {
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      return res.render("./_partial_views/UserProfileView", {
        user,
        user1,
        userPosts,
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "An error occurred while finding the user." });
    });
}
const settingsView = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  res.render("_partial_views/settings", { user });
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
  scrollToBottom,
  removeFriend,
  profileView,
  getUserById,
  thisUser,
  IdProfileView,
  settingsView,
};
