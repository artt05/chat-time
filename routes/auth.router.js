const express = require("express");

const {
  registerView,
  loginView,
  registerUser,
  loginUser,
  logoutUser,
  emailView,
  emailCheck,
  check,
  changePassword,
  changePasswordView,
  safewordView,
  deleteAccount,
} = require("../controllers/auth.controller");

const { allowIf } = require("../auth/protect");

const router = express.Router();

router.get("/register", allowIf, registerView);
router.get("/login", allowIf, loginView);
router.get("/logout", logoutUser);
router.get("/deleteAccount", deleteAccount);

router.get("/email-view", allowIf, emailView);
router.post("/email-check", allowIf, emailCheck);
router.post("/check/:id", allowIf, check);
router.get("/safeword-view/:id", safewordView);
router.post("/change-password/:id", changePassword);
router.get("/changepassword-view/:id", changePasswordView);

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
