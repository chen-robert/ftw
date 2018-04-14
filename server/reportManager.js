"use strict";

const mongoose = require("mongoose");
const reportSchem = new mongoose.Schema({
    username: String,
    comment: String,
    ip: String
});

module.exports.Report = mongoose.model("Report", reportSchem);

module.exports.addReport = function (name, comment, ip, callback) {
    module.exports.Report.findOne({
        username: {
            $regex: new RegExp(name, "i")
        },
        comment: {
            $regex: new RegExp(comment, "i")
        },
        ip: ip
    }).exec(function (err, data) {
        if (err) throw err;
        if (data) {
            //Don't let the user know we've silently eaten their report
            callback(err);
        } else {
            module.exports.Report.create({
                username: name,
                comment: comment,
                ip: ip
            }, (err) => {
                if (err) {
                    console.error("Problem with saving report");
                    console.error(err);
                }
                callback(err);
            });
        }
    });
}
