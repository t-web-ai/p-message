const { SocketService } = require("./SocketService");

function connection(socket, io) {
  const ownerId = socket.id;
  const socketService = new SocketService(ownerId, io);
  socket.on("createPairOfNameAndId", (username) =>
    socketService.registerUser(username)
  );
  socket.on("sendMessage", (data) => socketService.sendMessage(data));
  socket.on("viewMessage", (receiverID, senderID) =>
    socketService.viewMessage(receiverID, senderID)
  );
  socket.on("disconnect", () => socketService.userDisconnect());
}

module.exports = connection;
