"use strict";

const mongoose = require("mongoose");

const userData = require("./userData.js");

const chatManager = require("./chat/chatManager.js");
const gameManager = require("./gameManager.js");

class UserManager {
    constructor(io) {
        this.io = io;
        this.users = new Map();

        this.gameManager = gameManager(io);
    }

    addSession(id, username, callback) {
        const _self = this;

        userData.findOne({
            username: username
        }).exec(function (err, obj) {
            if (err) throw err;
            if (!obj) {
                throw new Error(username + " doesn't have data attached for some reason");
            }
            _self.users.set(id, obj);

            callback();
        });
    }
    removeSession(id) {
        this.users.delete(id);
    }
    addSocket(id, socket) {
        if (id) {
            if (!this.users.has(id)) {
                return false;
            }

            const data = this.users.get(id);
            socket.on("disconnect", () => {
                chatManager.users.delete(data.username);
                this.updateAllUsers();
            });
            chatManager.addUser(data, socket);
            this.gameManager.addSocket(data, socket, () => this.updateAllUsers());
            this.updateAllUsers();
            return true;
        }
        return false;
    }

    createData(username, callback) {
        userData.findOne({
            username: {
                $regex: new RegExp(username, "i")
            }
        }).exec(function (err, data) {
            if (err) throw err;
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

}

module.exports = UserManager;
