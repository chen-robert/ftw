const userData = require('./userData.js');

const chatManager = require('./chat/chatManager.js');
const gameManager = require('./gameManager.js');

class UserManager {
  constructor(io) {
    this.io = io;
    this.users = new Map();

    this.gameManager = gameManager(io);
  }

  addSession(id, username, callback) {
    userData.findOne({ username }).exec((err, obj) => {
      if (err) {
        throw err;
      }

      if (!obj) {
        throw new Error(`${username} doesn't have data attached for some reason`);
      }

      this.users.set(id, obj);

      callback();
    });
  }

  removeSession(id) {
    this.users.delete(id);
  }

  addSocket(id, socket) {
    let data;

    if (this.users.has(id)) {
      data = this.users.get(id);
    } else {
      /**
       * To prevent users from taking guest usernames, it has a space.
       * The probability of two guests having the same username is very close to 0.
       */
      data = {
        username: `Guest ${Math.random().toString(36).substr(2, 11)}`,
        rating: 1200,
      };

      // To prevent guests from talking, we remove HTML client side and mute them server side.
      chatManager.muted.add(data.username);
    }

    socket.on(
      'disconnect',

      () => {
        chatManager.users.delete(data.username);
        this.updateAllUsers();

        if (this.users.has(id)) {
          chatManager.muted.delete(data.username);
        }
      },
    );

    chatManager.addUser(data, socket);
    this.gameManager.addSocket(data, socket, () => this.updateAllUsers());
    this.updateAllUsers();
  }

  getData(username, callback) {
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
        callback(null, {
          username: data.username,
          rating: data.rating,
          games: data.games,
          wins: data.wins,
        });
        return;
      }

      callback({
        err: 'No data found',
      });
    });
  }

  /* eslint class-methods-use-this: 0 */
  createData(username, callback) {
    userData.findOne({
      username: {
        $regex: new RegExp(username, 'i'),
      },
    }).exec((err, data) => {
      if (err) {
        throw err;
      }

      if (data) {
        // Data already exists. No need to create new.
      } else {
        userData.create({
          username,
          rating: 1200,
        });
      }

      callback();
    });
  }

  updateAllUsers() {
    this.io.emit('online users', chatManager.onlineUsers);
  }
}

module.exports = UserManager;
