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
  }

  //Confirm Passwords

  if (password !== confirm) {
    console.log("Password must match");
  } else {
    //Validation
    User.findOne({ email: email }).then((user) => {
      if (user) {
        console.log("email exists");
        res.render("register", {
          name,
          email,
          password,
          confirm,
          safeword,
        });
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
const check = async (req, res) => {
  const { email, safeword } = req.body;
  const user = User.findOne({ email: email });
  console.log(req.body);
  if (user.safeword !== safeword) {
    console.log("Please fill in all the fields");
    res.render("login", {
      email,
    });
  } else {
    res.render("changepassword-check", { email });
  }
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
const emailCheck = (req, res) => {
  const { email } = req.body;
  const user = User.findOne({ email: email });
  console.log(req.body);
  if (!email && !user) {
    console.log("Please fill in all the fields");
    res.render("login", {
      email,
    });
  } else {
    res.render("safeword-view", { email });
  }
};
const loginUser = (req, res) => {
  const { email, password } = req.body;

  //Required
  if (!email || !password) {
    console.log("Please fill in all the fields");
    res.render("login", {
      email,
      password,
    });
  } else {
    passport.authenticate("local", {
      successRedirect: "/index",
      failureRedirect: "/login",
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

  emailView,
  check,
  emailCheck,
};
