"use strict";

const mongoose = require("mongoose");

const userDataSchem = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    rating: Number
});

module.exports = mongoose.model("UserData", userDataSchem);
