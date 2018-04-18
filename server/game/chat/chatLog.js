const mongoose = require('mongoose');

const chatLogSchem = new mongoose.Schema({
  date: String,
  time: String,
  username: String,
  message: String,
});

module.exports = mongoose.model('ChatLog', chatLogSchem);
