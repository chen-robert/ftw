'use strict';

/* eslint-env browser, jquery */
(function () {
  if (window.FTW && !window.FTW.game) {
    var game = {};

    // This is the button that appears on the nav
    $('#create-game-button').click(function () {
      $('#create-game-modal').modal('toggle');

      $('#create-ftw').trigger('click');
    });

    // This is the button that appears in the modal box.
    $('#create-game').click(function () {
      window.FTW.socket.emit('create game', {
        time: $('#create-time').val(),
        problems: $('#create-problem-count').val(),
        password: $('#game-password').val(),
        type: window.FTW.game.currMode
      });

      $('#game-password').val('');
      $('#create-game-modal').modal('toggle');
    });

    $('#join-game').click(function () {
      window.FTW.socket.emit('join game', {
        id: game.currChoice,
        pw: $('#game-join-password').val()
      });

      $('#game-join-modal').modal('toggle');
      $('#game-join-password').val('');
    });

    $('#create-ftw').click(function () {
      $('#create-ftw').addClass('active');
      $('#create-countdown').removeClass('active');

      $('#create-time').prop('disabled', false);
      $('#create-problem-count').prop('disabled', false);

      window.FTW.game.currMode = 'FTW';
    });

    $('#create-countdown').click(function () {
      $('#create-countdown').addClass('active');
      $('#create-ftw').removeClass('active');

      $('#create-time').prop('disabled', true);
      $('#create-problem-count').prop('disabled', true);

      window.FTW.game.currMode = 'CD';
    });

    $('#leave-game-button').click(function () {
      return window.FTW.socket.emit('leave game');
    });

    $('#start-game-button').click(function () {
      window.FTW.socket.emit('start game');
      $('#start-game-button').hide();
    });

    $('#answer-box').keypress(function (e) {
      if (e.which === 13) {
        window.FTW.socket.emit('answer', $('#answer-box').val());
        $('#answer-box').val('');
        $('#answer-box').hide();
      }
    });

    game.leaveGame = function () {
      $('#problem-box').hide();
      $('#start-game-button').hide();
      $('#leave-game-button').hide();
      $('#table-scores').hide();

      $('#game-display').show();
      $('#create-game-button').show();
      $('#table-ratings').show();

      $('#timer').stop(true, true);
      $('#timer').css('width', '');

      $('#problem-header').text('Waiting to start...');
      $('#problem-text').text('');
    };

    game.joinGame = function () {
      $('#problem-box').show();
      $('#leave-game-button').show();
      $('#table-scores').show();

      $('#game-display').hide();
      $('#create-game-button').hide();
      $('#review-game-button').hide();
      $('#table-ratings').hide();

      $('#answer-box').hide();
    };

    game.setHost = function () {
      $('#start-game-button').show();
    };

    game.setTimer = function (params) {
      $('#problem-header').text(params.type);
      $('#timer').stop(true, true);
      $('#timer').css('width', '');
      $('#timer').animate({ width: '100%' }, params.time * 1000);

      $('#answer-box').hide();
    };

    game.setProblem = function (problem) {
      console.log('==== Problem Data ====');
      console.log(problem);

      $('#problem-text').html(problem.text);

      $('#start-game-button').hide();

      $('#answer-box').show();
      $('#answer-box').val('');
      $('#answer-box').focus();
    };

    game.setScores = function (scores) {
      scores.sort(function (a, b) {
        return b.score - a.score;
      });
      $('#userScores').empty();

      for (var i = 0; i < scores.length; i += 1) {
        var disp = scores[i].username;
        var dispColor = '';

        if (scores[i].answer) {
          disp += ': ' + scores[i].answer.text;
          dispColor = scores[i].answer.correct ? 'table-success' : 'table-danger';
        }

        $('#userScores').append('<tr class=\'' + dispColor + '\'><td>' + disp + '</td><td class=\'text-right\'>' + scores[i].score + '</td></tr>');
      }
    };

    game.loadGames = function (dataObj) {
      $('#game-display').empty();

      // Regenerate all games. This sacrifices efficiency for simplicity.

      var _loop = function _loop(i) {
        var uuid = Object.keys(dataObj)[i];
        var data = dataObj[uuid];

        if (data.host !== null) {
          var box = document.createElement('div');
          $(box).addClass('game-box');

          var header = document.createElement('div');
          $(header).addClass('game-disp-header');
          if (data.started) {
            $(header).text('Game Started');
          } else {
            $(header).text(data.type);
          }

          var body = document.createElement('div');
          $(body).addClass('game-disp-body');
          $(body).append('<p>Players: ' + data.users.length + '</p>');
          $(body).append('<p>' + data.timePerProblem + 'sec</p>');

          if (data.type !== 'CD') {
            $(body).append('<p>Problems: ' + data.problems + '</p>');
          } else {
            $(body).append('<p>CD Scoring</p>');
          }

          var footer = document.createElement('div');
          $(footer).addClass('game-disp-header');
          $(footer).text(data.host.username);

          box.appendChild(header);
          box.appendChild(body);
          box.appendChild(footer);

          if (data.started) {
            $(body).addClass('game-started');
          } else {
            $(box).click(function () {
              if (data.private) {
                $('#game-join-modal').modal('toggle');
                game.currChoice = uuid;
              } else {
                window.FTW.socket.emit('join game', {
                  id: uuid,
                  pw: ''
                });
              }
            });
          }

          $('#game-display').append(box);
        }
      };

      for (var i = 0; i < Object.keys(dataObj).length; i += 1) {
        _loop(i);
      }
    };

    $('#review-game-button').click(function () {
      $('#review-game-modal').modal('toggle');
      game.changeReviewProblem(0);
    });

    game.setReviewData = function (data) {
      $('#review-game-button').show();

      game.reviewProblemData = data;
      game.reviewProblemIndex = 0;
    };

    game.changeReviewProblem = function (delta) {
      if (game.reviewProblemData) {
        var arrLen = game.reviewProblemData.length;
        game.reviewProblemIndex += delta;
        game.reviewProblemIndex = (game.reviewProblemIndex % arrLen + arrLen) % arrLen;
        // Display problem
        var currProblem = game.reviewProblemData[game.reviewProblemIndex];
        $('#review-game-text').html(currProblem.text);
        $('#review-game-answer').html('<strong>Answer: ' + currProblem.answer + '</strong>');
      }
    };

    $('#review-game-button').click(function () {
      return $('#review-game-modal').show();
    });

    $('#review-game-left-button').click(function () {
      return game.changeReviewProblem(-1);
    });

    $('#review-game-right-button').click(function () {
      return game.changeReviewProblem(1);
    });

    window.FTW.game = game;
  }
})();
//# sourceMappingURL=game.js.map