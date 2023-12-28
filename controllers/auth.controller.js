const passport = require("passport");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

//For Register Page
const registerView = (req, res) => {
  res.render("register", {});
};

//Post Request for Register

const registerUser = (req, res) => {
  const { name, email, location, password, confirm, safeword } = req.body;
  console.log(safeword);
  if (!name || !email || !password || !confirm || !safeword) {
    console.log("Fill empty fields");
    res.redirect(
      `/register?error=` +
        encodeURIComponent("Fill empty fields") +
        `&color=` +
        encodeURIComponent("danger")
    );
  }

  //Confirm Passwords

  if (password !== confirm) {
    console.log("Password must match");
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
        console.log("email exists");
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
        console.log(newUser, safeword);
        //Password Hashing
        bcrypt.genSalt(10, (err, salt) =>
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
          })
        );
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
  console.log("mrriti" + id);
  res.render("changepassword-view", { id });
};
const check = async (req, res) => {
  const { safeword } = req.body;
  const id = req.params.id;
  console.log(safeword + " " + id);
  const user = await User.findOne({ id: id });
  const email = user.email;
  console.log(user.safeword);
  if (!safeword) {
    res.redirect(
      `/safeword-view/${id}?error=` +
        encodeURIComponent("Please fill in all the fields") +
        `&color=` +
        encodeURIComponent("danger")
    );
  } else if (user.safeword !== safeword) {
    console.log("Please fill in all the fields");
    res.redirect(
      `/safeword-view/${id}?error=` +
        encodeURIComponent("Wrong safeword, please try again") +
        `&color=` +
        encodeURIComponent("danger")
    );
  } else {
    res.redirect(`/changepassword-view/${id}`);
    // passport.authenticate("local", {
    //   successRedirect: `/changepassword-view/${id}`,
    //   failureRedirect:
    //     `/safeword-view/${id}?error=` +
    //     encodeURIComponent("Wrong safeword") +
    //     `&color=` +
    //     encodeURIComponent("danger"),
    //   // failureFlash: true,
    // })(req, res);
    // console.log("skiqka" + id);
  }
};
const deleteAccount = async (req, res) => {
  const id = req.user._id;
  User.findByIdAndDelete(id, (err, docs) => {
    res.redirect(
      `/login?error=` +
        encodeURIComponent("The account was deleted successfuly.") +
        `&color=` +
        encodeURIComponent("success")
    );
  });
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
  let { password, confirm } = req.body;
  const id = req.params.id;
  if (!password || !confirm) {
    res.redirect(
      `/changepassword-view/${id}?error=` +
        encodeURIComponent("Please fill in all the fields") +
        `&color=` +
        encodeURIComponent("danger")
    );
  } else if (password !== confirm) {
    console.log("Password must match");
    res.redirect(
      `/changepassword-view/${id}?error=` +
        encodeURIComponent("Password must match") +
        `&color=` +
        encodeURIComponent("danger")
    );
  } else {
    console.log("id", id);
    console.log("password", password);
    bcrypt.genSalt(10, async (err, salt) =>
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) throw err;

        password = hash;

        console.log("password", password);
        const user = await User.findByIdAndUpdate(id, {
          password,
        });

        console.log(user.email);
        console.log("sfsfsf");
        res.redirect(
          `/login?error=` +
            encodeURIComponent("Password was changed sccsessfuly!") +
            `&color=` +
            encodeURIComponent("success")
        );
      })
    );
  }
};
const safewordView = (req, res) => {
  const id = req.params.id;
  res.render("safeword-view", { id });
};
const emailCheck = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  console.log(email, user);
  if (!email) {
    console.log("Please fill in all the fields");
    res.redirect(
      `/email-view?error=` +
        encodeURIComponent("Please fill in all the fields") +
        `&color=` +
        encodeURIComponent("danger")
    );
  } else if (!user) {
    console.log("email does not exist");
    res.redirect(
      `/email-view?error=` +
        encodeURIComponent("Email does not exist") +
        `&color=` +
        encodeURIComponent("danger")
    );
  } else {
    const id = user._id;
    console.log("id", user._id, email);
    res.redirect(`safeword-view/${id}`);
  }
};
const loginUser = (req, res) => {
  const { email, password } = req.body;

  //Required
  if (!email || !password) {
    console.log("Please fill in all the fields");
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
  res.redirect("/login");
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
};
