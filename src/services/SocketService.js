const { User } = require("../types/User");
const { UserRepository } = require("../repositories/UserRepository");

const userRepository = new UserRepository();

class SocketService {
  constructor(ownerId, io) {
    this.ownerId = ownerId;
    this.io = io;
  }
  registerUser(username) {
    let user = new User(this.ownerId, username);
    userRepository.addUser(user);
    this.io.to(user.id).emit("getPairOfNameAndId", user);
    this.io.emit("getOnlineUsers", userRepository.getAllUsers());
  }

  sendMessage(data) {
    let receiver = userRepository.findUser(data.receiver);
    let sender = userRepository.findUser(data.sender);
    if (sender && this.ownerId == sender.id && receiver)
      this.io.to(receiver.id).emit("getMessage", data, sender.name);
  }

  viewMessage(receiverID, senderID) {
    let receiver = userRepository.findUser(receiverID);
    let sender = userRepository.findUser(senderID);
    if (sender && this.ownerId == sender.id && receiver) {
      this.io.to(this.ownerId).emit("viewMessage", this.ownerId, receiverID);
    }
  }

  userDisconnect() {
    let owner = userRepository.findUser(this.ownerId);
    if (owner) {
      userRepository.removeUser(this.ownerId);
      this.io.emit("getOnlineUsers", userRepository.getAllUsers());
    }
  }
}

module.exports = { SocketService };
