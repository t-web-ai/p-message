class UserRepository {
  constructor() {
    this.users = [];
  }
  addUser(user) {
    this.users.push(user);
  }
  getAllUsers() {
    return this.users;
  }
  findUser(id) {
    return this.users.find((user) => user.id == id);
  }
  removeUser(id) {
    this.users = this.users.filter((user) => user.id != id);
  }
}
module.exports = { UserRepository };
