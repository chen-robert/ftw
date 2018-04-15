const chatUtils = require("./chatUtils.js");

const emoji = require("emoji-parser");
emoji.init().update();

const swearList = require("swearjar");

class ChatManager {
    constructor() {
        this.users = new Map();
    }
    addUser(data, socket) {
        const name = data.username;
        const users = this.users;

        if (users.has(name)) {
            this.disconnect(name);
        }

        users.set(name, {
            socket: socket,
            data: data
        });
        const _self = this;
        socket.on("public message", function (message) {
            message = message.trim();
            if (typeof message !== "string") return;
            if (message.length == 0 || message.length > 120) return;


            message = swearList.censor(message);
            message = chatUtils.clean(message);
            message = chatUtils.parseLinks(message);
            message = emoji.parse(message, "/emoji");
            users.forEach((data) => data.socket.emit("message", {
                type: "public",
                from: name,
                message: message
            }));


        });
        socket.on("admin command", function (data) {
            if (data.key === process.env.ADMIN_PASSWORD && typeof data.command === "string") {
                const parts = data.command.split(" ");
                if (parts.length == 2) {
                    if (parts[0] === "kick") {
                        _self.disconnect(parts[1]);
                    }
                }
            } else {
                console.error(name + " tried executing " + data.command + " with key " + data.key);
            }
        });
    }
    get onlineUsers() {
        const pool = [];
        this.users.forEach(data => pool.push(data.data));
        return pool;
    }
    disconnect(name) {
        if (this.users.has(name)) {
            this.users.get(name).socket.emit("redirect", "/logout");
            this.users.get(name).socket.disconnect();
        }
    }
}

module.exports = new ChatManager();
