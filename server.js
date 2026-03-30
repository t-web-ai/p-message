const app = require("./index");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 3000;
const connection = require("./src/services/ConnectionService");
const server = app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}...`);
});

const io = new Server(server);
io.on("connection", (socket) => connection(socket, io));
