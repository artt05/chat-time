const express = require("express");
const fs = require("fs");
const socket = require("socket.io");
const https = require("https");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const WebSocket = require("ws");
const session = require("express-session");
const cookieSession = require("cookie-session");
dotenv.config();
const passport = require("passport");
const { loginCheck } = require("./auth/passport");
const User = require("./models/user.model");
// const wss = new WebSocket.Server({ server });
loginCheck(passport);
const config = {
  CLIENT_SECRET_1: process.env.CLIENT_SECRET_1,
  CLIENT_SECRET_2: process.env.CLIENT_SECRET_2,
};
const auth = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
};

// Mongo DB conncetion
const database = process.env.MONGO_URI;
mongoose
  .connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));

app.use(express.static("public"));
app.set("view engine", "ejs");

// wss.on("connection", (ws) => {
//   // Handle new WebSocket connections
//   ws.on("message", (message) => {
//     // Broadcast the message to all connected clients
//     wss.clients.forEach((client) => {
//       if (client !== ws && client.readyState === WebSocket.OPEN) {
//         client.send(message);
//       }
//     });
//   });
// });
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Add this line to parse JSON bodies
app.use(
  cookieSession({
    name: "session1",
    // saveUninitialized: true,
    // resave: true,
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.CLIENT_SECRET_1, config.CLIENT_SECRET_2],
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use("/", require("./routes/auth.router"));
app.use("/", require("./routes/chat.route"));
app.use("/", require("./routes/post.router"));
app.get("/*", (req, res) => {
  res.redirect("/index");
});
const PORT = process.env.PORT;

app.listen(PORT, console.log("Server has started at port " + PORT));
