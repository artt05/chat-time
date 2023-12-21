const express = require("express");
const socket = require("socket.io");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
dotenv.config();
const passport = require("passport");
const { loginCheck } = require("./auth/passport");
const User = require("./models/user.model");

loginCheck(passport);

// Mongo DB conncetion
const database = process.env.MONGO_URI;
mongoose
  .connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));

app.use(express.static("public"));
app.set("view engine", "ejs");

//BodyParsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Add this line to parse JSON bodies
app.use(
  session({
    secret: "oneboy",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use("/", require("./routes/auth.router"));
app.use("/", require("./routes/chat.route"));
app.use("/", require("./routes/post.router"));

const PORT = process.env.PORT;

app.listen(PORT, console.log("Server has started at port " + PORT));
