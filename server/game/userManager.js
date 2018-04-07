"use strict";

const mongoose = require("mongoose");

const userData = require("./userData.js");

class UserManager {
    constructor() {
        this.users = new Map();
    }

    addSession(id, username) {
        const _self = this;

        userData.findOne({
            username: username
        }).exec(function (err, obj) {
            if (err) throw err;
            if (!obj) {
                throw new Error(username + " doesn't have data attached for some reason");
            }
            _self.users.set(id, obj);
        });
    }
    removeSession(id) {
        this.users.delete(id);
    }


    createData(username, callback) {
        userData.findOne({
            username: {
                $regex: new RegExp(username, "i")
            }
        }).exec(function (err, data) {
            if (err) throw err;
            if (data) {
                //Data already exists. We just silently eat up the error.
            } else {
                userData.create({
                    username: username,
                    rating: 1200
                });
            }
            callback();

        });

    }

}

module.exports = new UserManager();
