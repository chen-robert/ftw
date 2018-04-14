const chatUtils = require("./chatUtils.js");

const emoji = require("emoji-parser");
emoji.init().update();

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
        const _self = this;
        socket.on("public message", function (message) {
            message = message.trim();
            if (typeof message !== "string" || message.length == 0) return;

            message = chatUtils.clean(message);
            message = chatUtils.parseLinks(message);
            message = emoji.parse(message, "/emoji");
            users.forEach((data) => data.socket.emit("message", {
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
