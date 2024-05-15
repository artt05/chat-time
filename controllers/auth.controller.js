const passport = require("passport");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const salt = require("../salt/salt");
const Post = require("../models/post.model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
//For Register Page
const registerView = (req, res) => {
  res.render("register", {});
};

//Post Request for Register

const registerUser = (req, res) => {
  const { name, email, location, password, confirm } = req.body;
  if (!name || !email || !password || !confirm) {
    res.redirect(
      `/register?error=` +
        encodeURIComponent("Fill empty fields") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }

  //Confirm Passwords

  if (password !== confirm) {
    res.redirect(
      `/register?error=` +
        encodeURIComponent("Password must match") +
        `&color=` +
        encodeURIComponent("danger")
    );
  } else {
    //Validation
    User.findOne({ email: email }).then((user) => {
      if (user) {
        res.redirect(
          `/register?error=` +
            encodeURIComponent("Email already exists") +
            `&color=` +
            encodeURIComponent("danger")
        );
      } else {
        //Validation
        const newUser = new User({
          name,
          email,
          location,
          password,
          safeword,
        });
        //Password Hashing
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;

          bcrypt.hash(newUser.safeword, salt, (err, hash1) => {
            if (err) throw err;
            newUser.safeword = hash1;
            newUser.password = hash;
            newUser
              .save()

              .then((user) => {
                req.login(user, function (err) {
                  if (err) {
                    console.log(err);
                  }
                  return res.redirect("/index");
                });
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
};

// For View
const loginView = (req, res) => {
  res.render("login", {});
};
// const safewordView = (req, res) => {
//   const { email } = req.body;
//   console.log(req.body);
//   if (!email) {
//     console.log("Please fill in all the fields");
//     res.render("login", {
//       email,
//     });
//   } else {
// res.render("safeword-view", { email });
//   }
// };
const changePasswordView = (req, res) => {
  const id = req.params.id;
  res.render("changepassword-view", { id });
};
const ForgotPassword = (req, res) => {
  const { email } = req.body;
};
const deleteAccount = async (req, res) => {
  const id = req.user._id;
  await Post.deleteMany({ user: id });
  User.findByIdAndDelete(id, (err, docs) => {
    res.redirect(
      `/login?error=` +
        encodeURIComponent("The account was deleted successfuly.") +
        `&color=` +
        encodeURIComponent("success")
    );
  });
};
const confirmPasswordView = (req, res) => {
  const id = req.params.id;
  res.render("confirmpassword-view", { id });
};
const confirmPassword = async (req, res) => {
  const id = req.params.id;
  const { password } = req.body;
  const user = await User.findOne({ _id: id });
  if (!password) {
    res.redirect(
      `/confirmpassword-view/${id}?error=` +
        encodeURIComponent("Please fill in all the fields") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }
  hashedPassword = await bcrypt.hash(password, salt);
  if (hashedPassword !== user.password) {
    res.redirect(
      `/confirmpassword-view/${id}?error=` +
        encodeURIComponent("Wrong password, please try again") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }
  res.redirect(`/changepassword-view/${id}`);
};
//Logging in Function
const emailView = (req, res) => {
  // const { email } = req.body;
  // const user = User.findOne({ email: email });
  // console.log(req.body);
  // if (!email && !user) {
  //   console.log("Please fill in all the fields");
  //   res.render("login", {
  //     email,
  //   });
  // } else {
  res.render("email-view");
};
// };
const changePassword = async (req, res) => {
  console.log("arti");
  const id = req.params.id;
  console.log("arti");
  console.log(id);
  if (!id) {
    return res.redirect(
      `/changepassword-view/${id}?error=` +
        encodeURIComponent("No User selected") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }
  console.log("arti", id);
  const { password, confirm } = req.body;
  if (!password || !confirm) {
    return res.redirect(
      `/changepassword-view/${id}?error=` +
        encodeURIComponent("Please fill in all the fields") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }
  console.log("arti");
  const user = await User.findById(id);
  console.log(user);
  if (password !== confirm) {
    return res.redirect(
      `/changepassword-view/${id}?error=` +
        encodeURIComponent("Password must match") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }
  const hashedPassword = await bcrypt.hash(password, salt);
  if (hashedPassword === user.password) {
    return res.redirect(
      `/changepassword-view/${id}?error=` +
        encodeURIComponent("Password must be different from the old one") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }

  user.password = hashedPassword;
  console.log(user);
  await user.save();
  // const user = await User.findByIdAndUpdate(id, {
  //   password,
  // });

  res.redirect(
    `/login?error=` +
      encodeURIComponent("Password was changed sccsessfuly!") +
      `&color=` +
      encodeURIComponent("success")
  );
};
const safewordView = (req, res) => {
  const id = req.params.id;
  res.render("safeword-view", { id });
};
const emailCheck = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!email) {
    res.redirect(
      `/email-view?error=` +
        encodeURIComponent("Please fill in all the fields") +
        `&color=` +
        encodeURIComponent("danger")
    );
  } else if (!user) {
    res.redirect(
      `/email-view?error=` +
        encodeURIComponent("Email does not exist") +
        `&color=` +
        encodeURIComponent("danger")
    );
  } else {
    const id = user._id;
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    const url = `http://https://chat-time.onrender.com/check/${token}`;
    console.log("mrriti");
    const transporter = nodemailer.createTransport({
      host: "smtp.titan.email",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log("mrriti1");
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Reset Password",
      text: `Click this link to reset your password: ${url}`,
    };
    const trans = transporter.sendMail(mailOptions);
    console.log("mrriti3", trans);
  }
};
const check = async (req, res) => {
  const { token } = req.params;
  console.log("mrrit", token);
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      res.redirect(
        `/email-view?error=` +
          encodeURIComponent("Token has expired") +
          `&color=` +
          encodeURIComponent("danger")
      );
    } else {
      res.redirect(`/changepassword-view/${decoded.id}`);
    }
  });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  //Required
  if (!email || !password) {
    res.redirect(
      `/login?error=` +
        encodeURIComponent("Please fill in all the fields") +
        `&color=` +
        encodeURIComponent("danger")
    );
  } else {
    passport.authenticate("local", {
      successRedirect: "/index",
      failureRedirect:
        `/login?error=` +
        encodeURIComponent("Wrong email or password") +
        `&color=` +
        encodeURIComponent("danger"),
      failureFlash: true,
    })(req, res);
  }
};
const logoutUser = (req, res) => {
  req.logout(); // Passport.js function to remove the user from the session
  return res.redirect("/login");
};
const updateProfile = async (req, res) => {
  const id = req.user._id;
  const { name, email } = req.body;
  if (!name || !email) {
    return res.redirect(
      `/profile-view?error=` +
        encodeURIComponent("Please fill in all the fields") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }
  const user = await User.findById(id);
  if (!user) {
    return res.redirect(
      `/profile-view?error=` +
        encodeURIComponent("User not found") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }
  if (user.email == email && user.name == name) {
    return res.redirect(
      `/users/profile-view?error=` +
        encodeURIComponent("No changes were made") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }
  user.name = name;
  user.email = email;
  await user.save();
  return res.redirect(
    `/users/profile-view?error=` +
      encodeURIComponent("Profile was updated successfuly!") +
      `&color=` +
      encodeURIComponent("success")
  );
};

module.exports = {
  registerView,
  loginView,
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  emailView,
  check,
  emailCheck,
  changePasswordView,
  safewordView,
  deleteAccount,
  confirmPasswordView,
  confirmPassword,
  updateProfile,
};
