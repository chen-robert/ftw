const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchem = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },
});

userSchem.pre(
  'save',

  function saveUser(next) {
    const user = this;

    bcrypt.hash(
      user.password,
      10,

      (err, hash) => {
        if (err) {
          next(err);
          return;
        }

        user.password = hash;
        next();
      },
    );
  },
);

module.exports = mongoose.model('User', userSchem);
