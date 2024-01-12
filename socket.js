// Import the Socket.io library

function listen(io) {
  const chatNamespace = io.of("/messages");
  const connectedUsers = {};

  chatNamespace.on("connection", (socket) => {
    console.log("User connected", socket.id);
    let roomName = "";
    connectedUsers[socket.id] = { connected: true, typing: false };

    // Emit 'join' event to notify user presence
    socket.broadcast.emit("join", { userId: socket.id, connectedUsers });
    socket.on("ready", ({ userId, senderId }) => {
      roomName = `ski aty `;

      // Join the room for both sender and receiver
      socket.join(roomName);
      console.log("Joined room:", roomName);
    });
    socket.on("message", ({ userId, senderId, message }) => {
      console.log("Received message:", message);

      // Create a room name based on the userId and senderId

      // Emit the message to the room
      chatNamespace
        .to(roomName)
        .emit("message", { senderId: senderId, message });

      console.log("message sent");
    });

    socket.on("typing", ({ senderId, isTyping }) => {
      connectedUsers[socket.id].typing = isTyping;
      console.log("Received typing:", isTyping);
      // Create a room name based on the userId and senderId

      // Join the room

      // Emit the typing event to the room
      chatNamespace
        .to(roomName)
        .emit("typing", { senderId: senderId, isTyping });

      console.log("typing sent");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
      delete connectedUsers[socket.id];
      chatNamespace.emit("join", { connectedUsers });
    });
  });
}

module.exports = { listen };
