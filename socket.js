// Import the Socket.io library

function listen(io) {
  const chatNamespace = io.of("/messages");
  const connectedUsers = {};

  chatNamespace.on("connection", (socket) => {
    let roomName = "";
    let roomName2 = "";
    connectedUsers[socket.id] = { connected: true, typing: false };

    // Emit 'join' event to notify user presence
    socket.broadcast.emit("join", { userId: socket.id, connectedUsers });
    socket.on("ready", ({ userId, senderId }) => {
      const sortedIds = [userId, senderId].sort();
      roomName = sortedIds.join("-");

      // Join the room for both sender and receiver
      socket.join(roomName);
    });
    socket.on("message", ({ userId, senderId, message }) => {
      // Create a room name based on the userId and senderId

      // Emit the message to the room
      chatNamespace
        .to(roomName)
        .emit("message", { senderId: senderId, message });
    });

    socket.on("typing", ({ senderId, isTyping }) => {
      connectedUsers[socket.id].typing = isTyping;
      // Create a room name based on the userId and senderId

      // Join the room

      // Emit the typing event to the room
      chatNamespace
        .to(roomName)
        .emit("typing", { senderId: senderId, isTyping });
    });

    socket.on("disconnect", () => {
      delete connectedUsers[socket.id];
      chatNamespace.emit("join", { connectedUsers });
    });
  });
}

module.exports = { listen };
