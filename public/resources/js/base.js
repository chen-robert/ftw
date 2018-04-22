'use strict';

/**
 * This JS file should be loaded first.
 */
/* eslint-env browser, jquery */
/* globals io */

(function () {
    if (!window.FTW) {
        window.FTW = {};
        window.FTW.socket = io();

        window.FTW.socket.on('message', function (msg) {
            return window.FTW.chat.safeAppend(msg);
        });

        window.FTW.socket.on('redirect', function (url) {
            return window.location.replace(url);
        });

        window.FTW.socket.on('notif error', function (err) {
            $('#alert-text').text(err);
            $('#alert').stop(true, true);
            $('#alert').show();
            $('#alert').css('top', '-100px');
            $('#alert').animate({ top: '50px' }, 1000).delay(5000).fadeOut(1000);
        });

        window.FTW.socket.on('online users', function (data) {
            return window.FTW.userUtils.setUsers(data);
        });

        window.FTW.socket.on('game data', function (data) {
            return window.FTW.game.loadGames(data);
        });

        window.FTW.socket.on('curr game', function (uuid) {
            window.FTW.game.currGame = uuid;
        });

        window.FTW.socket.on('join game', function (data) {
            window.FTW.game.joinGame(data);
        });

        window.FTW.socket.on('leave game', function (data) {
            return window.FTW.game.leaveGame(data);
        });

        window.FTW.socket.on('review game', function (data) {
            return window.FTW.game.setReviewData(data);
        });

        window.FTW.socket.on('set host', function () {
            return window.FTW.game.setHost();
        });

        window.FTW.socket.on('timer', function (data) {
            return window.FTW.game.setTimer(data);
        });

        window.FTW.socket.on('problem', function (data) {
            return window.FTW.game.setProblem(data);
        });

        window.FTW.socket.on('scores', function (data) {
            return window.FTW.game.setScores(data);
        });
    }
})();
//# sourceMappingURL=base.js.map