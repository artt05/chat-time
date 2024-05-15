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
  confirmPasswordView,
  confirmPassword,
  updateProfile,
} = require("../controllers/auth.controller");

const { allowIf, protectRoute } = require("../auth/protect");
const { update } = require("../models/user.model");

const router = express.Router();

router.get("/register", allowIf, registerView);
router.get("/login", allowIf, loginView);
router.get("/logout", logoutUser);
router.get("/deleteAccount", deleteAccount);

router.get("/email-view", allowIf, emailView);
router.post("/email-check", allowIf, emailCheck);
router.get("/check/:token", check);
router.post("/change-password/:id", changePassword);
router.get("/changepassword-view/:id", changePasswordView);
router.get("/confirmpassword-view/:id", confirmPasswordView);
router.get("/confirm-password/:id", confirmPassword);
router.post("/update-profile", protectRoute, updateProfile);

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
