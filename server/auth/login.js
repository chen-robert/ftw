const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const user = require('./user.js');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));

module.exports.login = (username, password, callback) => {
  user.findOne({ username }).exec((err, usr) => {
    if (err) {
      callback(err);
      return;
    }

    if (!usr) {
      const error = new Error('User not found');
      error.status = 401;
      callback(error);
      return;
    }

    bcrypt.compare(password, usr.password, (error, res) => {
      if (res === true) {
        callback(null, usr);
        return;
      }

      const badpw = new Error('Invalid password');
      badpw.status = 401;
      callback(badpw);
    });
  });
};

module.exports.register = (username, password, callback) => {
  user.findOne({
    username: {
      $regex: new RegExp(`^${username}$`, 'i'),
    },
  }).exec((err, obj) => {
    if (err) {
      callback(err);
      return;
    }

    if (!obj) {
      const error = new Error('Username already exists');
      error.status = 401;
      callback(error);
      return;
    }

    user.create(
      {
        username,
        password,
      },

      (error, userObj) => {
        if (err) {
          console.log('Failed to create user data');
          console.log(error);
          return callback(error);
        }

        return callback(null, userObj);
      },
    );
  });
};
