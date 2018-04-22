const userData = require('./userData.js');

const chatManager = require('./chat/chatManager.js');
const gameManager = require('./gameManager.js');

class UserManager {
  constructor(io) {
    this.io = io;
    this.users = new Map();
    this.ips = new Map();

    this.gameManager = gameManager(io);
  }

  addSession(id, username, ip, callback) {
    userData.findOne({ username }).exec((err, obj) => {
      if (err) {
        throw err;
      }
	  
      if (!obj) {
        console.error(`${username} doesn't have data attached for some reason. Creating new data.`);

        UserManager.createData(username, () => this.addSession(id, username, ip, callback));
        return;
      }

      this.users.set(id, obj);
      this.ips.set(id, ip);

      callback();
    });
  }

  removeSession(id) {
    this.users.delete(id);
  }

  addSocket(id, socket) {
    if (id) {
      if (!this.users.has(id) || !this.ips.has(id)) {
        return false;
      }

      const data = this.users.get(id);

      socket.on(
        'disconnect',

        () => {
          chatManager.users.delete(data.username);
          this.updateAllUsers();
        },
      );

      chatManager.addUser(data, socket, this.ips.get(id));
      this.gameManager.addSocket(data, socket, () => this.updateAllUsers());
      this.updateAllUsers();
      return true;
    }

    return false;
  }

  updateAllUsers() {
    this.io.emit('online users', chatManager.onlineUsers);
  }

  static getData(username, callback) {
    userData.findOne({
      username: {
        $regex: new RegExp(`^${username}$`, 'i'),
      },
    }).exec((err, data) => {
      if (err) {
        callback(err);
        return;
      }

      // We want tight control over what data is leaked
      if (data) {
        callback(
          null,

          {
            username: data.username,
            rating: data.rating,
            games: data.games,
            wins: data.wins,
          },
        );

        return;
      }

      callback({ err: 'No data found' });
    });
  }

  static createData(username, callback) {
    userData.findOne({
      username: {
        $regex: new RegExp(`^${username}$`, 'i'),
      },
    }).exec((err, data) => {
      if (err) {
        console.log(err);
        return;
      }

      if (data) {
        // Data already exists. No need to create new.
      } else if (typeof username === 'string') {
        userData.create({
          username,
          rating: 1200,
          games: 0,
          wins: 0,
        });
      } else {
        console.error(`Invalid username tried to be created: ${username}`);
      }

      callback();
    });
  }
}

module.exports = UserManager;
