/*
This JS file should be loaded first. 
*/

(function () {
    "use strict";

    if (!window.FTW) {
        window.FTW = {};
        window.FTW.socket = io();

        window.FTW.socket.on("message", (msg) => window.FTW.chat.appendMessage(msg.from, msg.message));
        window.FTW.socket.on("redirect", (url) => window.location.replace(url));

        window.FTW.socket.on("online users", (data) => window.FTW.userUtils.setUsers(data));
    }
})();
