const {
  indexView,
  searchView,
  sendRequest,
  acceptRequest,
  friendRequests,
  allFriendsView,
  sendMessage,
  rejectRequest,
  chatView,
  removeFriend,
} = require("../controllers/chat.controller");
const { protectRoute } = require("../auth/protect");
const router = require("./auth.router");
router.post("/users/:id/send-message", sendMessage);
router.get("/index", protectRoute, indexView);
router.get("/search", protectRoute, searchView);
router.get("/users/:id/send-request", protectRoute, sendRequest);
router.get("/users/friend-requests", protectRoute, friendRequests);
router.post("/users/:id/accept-request", protectRoute, acceptRequest);
router.get("/users/friends", protectRoute, allFriendsView);
router.post("/users/:id/reject-request", protectRoute, rejectRequest);
router.get("/chat/:id", protectRoute, chatView);
router.get("/remove-friend/:id", protectRoute, removeFriend);

module.exports = router;
