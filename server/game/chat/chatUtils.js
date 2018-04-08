"use strict";

class ChatManager {
    constructor() {
        this.users = new Map();
    }
    addUser(data, socket) {
        const name = data.username;
        const users = this.users;

        if (users.has(name)) {
            users.get(name).socket.emit("redirect", "/logout");
            users.get(name).socket.disconnect();
        }

        users.set(name, {
            socket: socket,
            data: data
        });
        socket.on("public message", function (message) {
            users.forEach((soc) => soc.emit("message", {
                type: "public",
                from: name,
                message: message
            }));
        });
    }
    get onlineUsers() {

        const pool = [];
        this.users.forEach(data => pool.push(data.data));
        return pool;
    }

}

module.exports = new ChatManager();
