/*
This JS file should be loaded first. 
*/

(function () {
    "use strict";

    if (!window.FTW) {
        window.FTW = {};
        window.FTW.socket = io();

        window.FTW.socket.on("message", (msg) => {
            window.FTW.chat.appendMessage(msg.from, msg.message);
            $("#chat-display").animate({
                scrollTop: $('#chat-display').prop("scrollHeight")
            }, 1000);;
        });
        window.FTW.socket.on("redirect", (url) => window.location.replace(url));

        window.FTW.socket.on("online users", (data) => window.FTW.userUtils.setUsers(data));

        window.FTW.socket.on("game data", (data) => window.FTW.game.loadGames(data));
        window.FTW.socket.on("curr game", (uuid) => window.FTW.game.currGame = uuid);
        window.FTW.socket.on("join game", (data) => window.FTW.game.joinGame(data));
        window.FTW.socket.on("leave game", (data) => window.FTW.game.leaveGame(data));
        window.FTW.socket.on("timer", (data) => window.FTW.game.setTimer(data));
        window.FTW.socket.on("problem", (data) => window.FTW.game.setProblem(data));
    }
})();
