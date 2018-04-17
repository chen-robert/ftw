"use strict";

const mongoose = require("mongoose");

var userSchem = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    change: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("RatingChange", userSchem);
