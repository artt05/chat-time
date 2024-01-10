function listen(io) {
  const chatNamespace = io.of("/messages");

  chatNamespace.on("connection", (socket) => {
    console.log("User connected");

    socket.on("join", (userId) => {
      // Join a room specific to the userId
      socket.join(userId);
      console.log(`User with ID ${userId} joined the chat`);
    });

    socket.on("message", ({ userId, message }) => {
      // Broadcast the message to the specific user
      chatNamespace
        .to(userId)
        .emit("message", { senderId: socket.id, message });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

module.exports = { listen };
