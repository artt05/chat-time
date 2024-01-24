const passport = require("passport");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const salt = require("../salt/salt");
const Post = require("../models/post.model");
//For Register Page
const registerView = (req, res) => {
  res.render("register", {});
};

//Post Request for Register

const registerUser = (req, res) => {
  const { name, email, location, password, confirm, safeword } = req.body;
  if (!name || !email || !password || !confirm || !safeword) {
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
//     res.render("safeword-view", { email });
//   }
// };
const changePasswordView = (req, res) => {
  const id = req.params.id;
  res.render("changepassword-view", { id });
};
const check = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ _id: id });

    if (!user) {
      // Handle the case where the user with the specified id is not found
      return res.status(404).json({ error: "User not found" });
    }

    // Generate salt

    // Hash the provided safeword with the generated salt
    const hashedSafeword = await bcrypt.hash(req.body.safeword, salt);

    if (user.safeword !== hashedSafeword) {
      return res.redirect(
        `/safeword-view/${id}?error=` +
          encodeURIComponent("Wrong safeword, please try again") +
          `&color=` +
          encodeURIComponent("danger")
      );
    }

    res.redirect(`/changepassword-view/${id}`);
  } catch (error) {
    console.error("Error in check function:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
  const { safeword, password, confirm } = req.body;
  if (!safeword || !password || !confirm) {
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
  const hashedSafeword = await bcrypt.hash(safeword, salt);
  console.log(hashedSafeword);
  if (hashedSafeword !== user.safeword) {
    return res.redirect(
      `/changepassword-view/${id}?error=` +
        encodeURIComponent("Wrong safeword, please try again") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }
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
    `/index?error=` +
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
    res.redirect(`/changepassword-view/${id}`);
  }
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
