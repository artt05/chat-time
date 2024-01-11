function listen(io) {
  const chatNamespace = io.of("/messages");
  const connectedUsers = {};

  chatNamespace.on("connection", (socket) => {
    console.log("User connected", socket.id);

    connectedUsers[socket.id] = { connected: true, typing: false };

    // Emit 'join' event to notify user presence
    socket.emit("join", { userId: socket.id, connectedUsers });
    socket.on("message", ({ userId, senderId, message }) => {
      console.log(message);
      console.log("userId", userId);
      console.log("senderId", senderId);
      console.log("socket.id", socket.id);

      // Create a room name based on the userId and senderId
      const roomName = `${userId}-${senderId}`;

      // Join the room for both sender and receiver
      socket.join(roomName);

      // Emit the message to the room
      chatNamespace
        .to(roomName)
        .emit("message", { senderId: senderId, message });
      console.log("message sent");
    });
    socket.on("typing", ({ userId, isTyping }) => {
      connectedUsers[socket.id].typing = isTyping;

      // Create a room name based on the userId and senderId
      const roomName = `${userId}-${socket.id}`;

      // Join the room
      socket.join(roomName);

      // Emit the typing event to the room
      chatNamespace
        .to(roomName)
        .emit("typing", { senderId: socket.id, isTyping });
      console.log("typing sent");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
      delete connectedUsers[socket.id];
      socket.broadcast.emit("join", { connectedUsers });
    });
  });
}

module.exports = { listen };
