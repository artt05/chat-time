const express = require("express");
const fs = require("fs");
const socket = require("socket.io");
const https = require("https");
const server = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const session = require("express-session");
const cookieSession = require("cookie-session");
dotenv.config();
const passport = require("passport");
const { loginCheck } = require("./auth/passport");
const User = require("./models/user.model");
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });
//
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

server.use(express.static("public"));
server.set("view engine", "ejs");

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
server.use(express.urlencoded({ extended: false }));
server.use(express.json()); // Add this line to parse JSON bodies
server.use(
  cookieSession({
    name: "session1",
    // saveUninitialized: true,
    // resave: true,
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.CLIENT_SECRET_1, config.CLIENT_SECRET_2],
  })
);

server.use(passport.initialize());
server.use(passport.session());

//Routes
server.use("/", require("./routes/auth.router"));
server.use("/", require("./routes/chat.route"));
server.use("/", require("./routes/post.router"));
server.get("/*", (req, res) => {
  res.redirect("/index");
});
const PORT = process.env.PORT;
console.log({ server });
server.listen(PORT, console.log("Server has started at port " + PORT));
wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    const data = JSON.parse(message);
    if (data.type === "message") {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "message", data: data.data }));
        }
      });
    }
  });
});

// wss.addEventListener("close", (event) => {
//   console.log("WebSocket closed. Reconnecting...");
//   // Reconnect logic goes here
// });
