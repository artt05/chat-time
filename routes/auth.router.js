const express = require("express");

const {
  registerView,
  loginView,
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/auth.controller");

const { allowIf } = require("../auth/protect");

const router = express.Router();

router.get("/register", allowIf, registerView);
router.get("/login", allowIf, loginView);
router.get("/logout", logoutUser);

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
