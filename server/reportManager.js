const mongoose = require('mongoose');

const reportSchem = new mongoose.Schema({
  username: String,
  comment: String,
  ip: String,
});

module.exports.Report = mongoose.model('Report', reportSchem);

module.exports.addReport = (name, comment, ip, callback) => {
  module.exports.Report.findOne({
    ip,

    username: {
      $regex: new RegExp(`^${name}$`, 'i'),
    },

    comment: {
      $regex: new RegExp(`^${comment}$`, 'i'),
    },
  }).exec((err, data) => {
    if (err) {
      throw err;
    }

    if (data) {
      // Don't let the user know we've silently eaten their report
      callback(err);
    } else {
      module.exports.Report.create({
          comment,
          ip,
          username: name,
        },

        (error) => {
          if (error) {
            console.error('Problem with saving report');
            console.error(error);
          }

          callback(error);
        },
      );
    }
  });
};
