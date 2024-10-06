const express = require("express");
const cookieParser = require("cookie-parser");
const http = require("http");
const io = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const cookieSession = require("cookie-session");
const passport = require("passport");
const { loginCheck } = require("./auth/passport");
const User = require("./models/user.model");
const sockets = require("./socket"); // Import your socket.js file
const { default: helmet } = require("helmet");

dotenv.config();

loginCheck(passport);

const config = {
  CLIENT_SECRET_1: process.env.CLIENT_SECRET_1,
  CLIENT_SECRET_2: process.env.CLIENT_SECRET_2,
};

const auth = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
};

const database = process.env.MONGO_URI;

mongoose
  .connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));

const server = express();
server.use(helmet());
server.use(express.static("public"));

server.set("view engine", "ejs");

server.use(express.urlencoded({ extended: false }));
server.use(express.json());

server.use(
  cookieSession({
    name: "session1",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.CLIENT_SECRET_1, config.CLIENT_SECRET_2],
  })
);

server.use(passport.initialize());
server.use(passport.session());
server.use("/uploads", express.static("uploads"));
server.use("/", require("./routes/auth.router"));
server.use("/", require("./routes/chat.route"));
server.use("/", require("./routes/post.router"));
server.get("/*", (req, res) => {
  res.redirect("/index");
});

const PORT = process.env.PORT;
const httpServer = http.createServer(server);
const socketServer = io(httpServer);

httpServer.listen(PORT, () => {
  console.log("Server has started at port " + httpServer, PORT);
});
sockets.listen(socketServer);

// Note: I have removed the WebSocket-related code since you're using Socket.IO

// You've already initialized Socket.IO in socket.js, so there's no need to use a WebSocket Server separately.
