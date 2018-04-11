"use strict";

const emoji = require("emoji-parser");
emoji.init().update();
const Filter = require("bad-words");
const filter = new Filter();

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

            message = _self.clean(message);
            message = _self.parseLinks(message);
            message = filter.clean(message);
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
    clean(str) {
        return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    parseLinks(str) {
        function norm(n) {
            return (n + (str.length + 1)) % (str.length + 1);
        }
        var index = Math.min(norm(str.indexOf("http://")), norm(str.indexOf("https://")));
        while (index != str.length) {
            var end = str.indexOf(" ", index);
            if (end == -1) end = str.length;

            var urlText = str.substring(index, end);

            var ending = str.substring(end);
            str = str.substring(0, index) + "<a target=\"_blank\" rel=\"noopener noreferrer\"" +
                "href=\"" + urlText + "\">" + urlText + "</a>";
            var nextStart = str.length;

            str += ending;

            index = Math.min(norm(str.indexOf("http://", nextStart)),
                norm(str.indexOf("https://", nextStart)));
        }
        return str;
    }


}

module.exports = new ChatManager();
