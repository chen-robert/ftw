/**
 * This JS file should be loaded first.
 */
/* eslint-env browser, jquery */
/* globals io */

(() => {
  if (!window.FTW) {
    window.FTW = {};
    window.FTW.socket = io();

    window.FTW.socket.on('message', msg => window.FTW.chat.safeAppend(msg));

    window.FTW.socket.on('redirect', url => window.location.replace(url));

    window.FTW.socket.on(
      'notif error',

      (err) => {
        $('#alert-text').text(err);
        $('#alert').stop(true, true);
        $('#alert').show();
        $('#alert').css('top', '-100px');
        $('#alert').animate({ top: '50px' }, 1000).delay(5000).fadeOut(1000);
      },
    );

    window.FTW.socket.on('online users', data => window.FTW.userUtils.setUsers(data));

    window.FTW.socket.on('game data', data => window.FTW.game.loadGames(data));

    window.FTW.socket.on(
      'curr game',

      (uuid) => {
        window.FTW.game.currGame = uuid;
      },
    );

    window.FTW.socket.on(
      'join game',

      (data) => {
        window.FTW.game.joinGame(data);
      },
    );

    window.FTW.socket.on('leave game', data => window.FTW.game.leaveGame(data));

    window.FTW.socket.on('review game', data => window.FTW.game.setReviewData(data));

    window.FTW.socket.on('set host', () => window.FTW.game.setHost());

    window.FTW.socket.on('timer', data => window.FTW.game.setTimer(data));

    window.FTW.socket.on('problem', data => window.FTW.game.setProblem(data));

    window.FTW.socket.on('scores', data => window.FTW.game.setScores(data));

    window.FTW.socket.on('chat freeze', freeze => window.FTW.chat.freezeChat(freeze));
  }
})();
