const mongoose = require('mongoose');

const userDataSchem = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },

  rating: Number,
  wins: Number,
  games: Number,
});

module.exports = mongoose.model('UserData', userDataSchem);
