const chatUtils = require("./chatUtils.js");

const emoji = require("emoji-parser");
emoji.init().update();

const swearList = require("swearjar");

class ChatManager {
    constructor() {
        this.users = new Map();
        this.muted = new Set();
        this.banned = new Set();
    }
    addUser(data, socket, ip) {
        const name = data.username;
        const users = this.users;

        if (users.has(name)) {
            this.disconnect(name);
        }
        if (this.banned.has(name) || this.banned.has(ip)) {
            socket.emit("redirect", "/logout");
            socket.disconnect();
            return;
        }

        users.set(name, {
            socket: socket,
            data: data
        });
        const _self = this;
        const rateLimit = [];
        socket.on("public message", function (message) {
            if (_self.muted.has(name)) return;

            const currTime = +new Date();
            while (rateLimit.length > 0 && rateLimit[0] < currTime - 5 * 1000) {
                rateLimit.shift();
            }
            rateLimit.push(currTime);

            if (rateLimit.length > 5) {
                socket.emit("message", _self.toMessage("Please slow down!"));
                return;
            } else {
                message = _self.process(message);
                if (typeof message === "string") {
                    users.forEach((data) => data.socket.emit("message", {
                        type: "public",
                        from: name,
                        message: message
                    }));
                }
            }

        });

        socket.on("whisper", function (data) {
            if (_self.muted.has(name)) return;

            let message = data.message;
            let to = data.to;
            message = _self.process(message);
            if (typeof message === "string" && typeof to === "string") {
                if (_self.users.has(to)) {
                    const msg = {
                        type: "private",
                        from: name,
                        message: message
                    }
                    _self.users.get(to).socket.emit("message", msg);
                    socket.emit("message", msg);
                } else {
                    socket.emit("message", _self.toMessage("Username not found"));
                }
            }

        });
        socket.on("admin command", function (data) {
            if (data.key === process.env.ADMIN_PASSWORD && typeof data.command === "string") {
                const parts = data.command.split(" ");
                if (parts.length == 2) {
                    if (parts[0] === "kick") {
                        _self.disconnect(parts[1]);
                    } else if (parts[0] === "mute") {
                        _self.muted.add(parts[1]);
                        socket.emit("message", _self.toMessage(parts[1] + " is now muted!"));
                    } else if (parts[0] === "unmute") {
                        _self.muted.delete(parts[1]);
                        socket.emit("message", _self.toMessage(parts[1] + " is no longer muted!"));
                    } else if (parts[0] === "ban") {
                        _self.banned.add(parts[1]);
                        _self.disconnect(parts[1]);

                        socket.emit("message", _self.toMessage(parts[1] + " is now banned!"));
                    } else if (parts[0] === "unban") {
                        _self.banned.delete(parts[1]);

                        socket.emit("message", _self.toMessage(parts[1] + " is no longer banned!"));
                    } else if (parts[0] === "restart") {
                        users.forEach((data) => data.socket.emit("notif error", "Server Restarting"));
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
    process(message) {
        if (typeof message !== "string") return null;
        message = message.trim();
        if (message.length == 0 || message.length > 120) return null;


        message = swearList.censor(message);
        message = chatUtils.clean(message);
        message = chatUtils.parseLinks(message);
        message = emoji.parse(message, "/emoji");
        return message;
    }
    toMessage(str) {
        return {
            type: "public",
            from: "Console",
            message: str
        };
    }
}

module.exports = new ChatManager();
