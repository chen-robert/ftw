"use strict";

class ChatManager {
    constructor() {
        this.users = new Map();
    }
    addUser(name, socket) {
        const users = this.users;

        users.set(name, socket);
        socket.on("disconnect", () => this.users.delete(name));
        socket.on("public message", function (message) {
            users.forEach((soc) => soc.emit("message", {
                type: "public",
                from: name,
                message: message
            }));
        });
    }
}

module.exports = new ChatManager();
