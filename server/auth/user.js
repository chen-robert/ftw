"use strict";

const mongoose = require("mongoose");

var userSchem = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    }
});

userSchem.pre("save", function (next) {
    const user = this;
    bcrypt.hash(user.password, 10000, function (err, hash) {
        if (err) {
            return new(err);
        }
        user.password = hash;
        next();
    });
});

module.exports = mongoose.model("User", userSchem);
