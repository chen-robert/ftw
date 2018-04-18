"use strict";

const mongoose = require("mongoose");

const userData = require("./userData.js");

const chatManager = require("./chat/chatManager.js");
const gameManager = require("./gameManager.js");

class UserManager {
    constructor(io) {
        this.io = io;
        this.users = new Map();
        this.ips = new Map();

        this.gameManager = gameManager(io);
    }

    addSession(id, username, ip, callback) {
        const _self = this;

        userData.findOne({
            username: username
        }).exec(function (err, obj) {
            if (err) throw err;

            if (!obj) {
                console.error(username + " doesn't have data attached for some reason. Creating new data.");
                return _self.createData(username, () => _self.addSession(id, username, ip, callback));
            }

            _self.users.set(id, obj);
            _self.ips.set(id, ip);

            callback();
        });
    }
    removeSession(id) {
        this.users.delete(id);
    }
    addSocket(id, socket) {
        if (id) {
            if (!this.users.has(id) || !this.ips.has(id)) {
                return false;
            }

            const data = this.users.get(id);
            socket.on("disconnect", () => {
                chatManager.users.delete(data.username);
                this.updateAllUsers();
            });
            chatManager.addUser(data, socket, this.ips.get(id));
            this.gameManager.addSocket(data, socket, () => this.updateAllUsers());
            this.updateAllUsers();
            return true;
        }
        return false;
    }

    createData(username, callback) {
        userData.findOne({
            username: {
                $regex: new RegExp("^" + username + "$", "i")
            }
        }).exec(function (err, data) {
            if (err) return console.log(err);
            if (data) {
                //Data already exists. No need to create new.
            } else {
                userData.create({
                    username: username,
                    rating: 1200
                });
            }
            callback();

        });

    }
    updateAllUsers() {
        this.io.emit("online users", chatManager.onlineUsers);
    }
    getData(username, callback) {
        userData.findOne({
            username: {
                $regex: new RegExp("^" + username + "$", "i")
            }
        }).exec(function (err, data) {
            if (err) return callback(err);

            //We want tight control over what data is leaked
            if (data) return callback(null, {
                username: data.username,
                rating: data.rating,
                games: data.games,
                wins: data.wins
            });

            callback({
                err: "No data found"
            });
        });
    }

}

module.exports = UserManager;
