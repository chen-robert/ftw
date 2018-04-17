"use strict";

const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const user = require("./user.js");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));

module.exports.login = function (username, password, callback) {
    user.findOne({
        username: username
    }).exec(function (err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {
            var err = new Error("User not found");
            err.status = 401;
            return callback(err);
        }
        bcrypt.compare(password, user.password, function (err, res) {
            if (res === true) {
                return callback(null, user);
            }
            var err = new Error("Invalid password");
            err.status = 401;
            callback(err);
        });
    });
}
module.exports.register = function (username, password, callback) {
    user.findOne({
        username: {
            $regex: new RegExp("^" + username, "i")
        }
    }).exec(function (err, obj) {
        if (err) {
            return callback(err);
        }
        if (obj) {
            var err = new Error("Username already exists");
            err.status = 401;
            return callback(err);
        }
        user.create({
            username: username,
            password: password
        }, function (err, obj) {
            if (err) {
                return callback(err);
            }
            return callback(null, obj);
        });
    });
}
