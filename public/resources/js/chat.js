'use strict';

/* eslint-env browser, jquery */
/* globals jdenticon, emojies */
$(document).ready(function () {
  var formatDate = function getPrettyDate(date) {
    var day = date.getHours();
    var min = date.getMinutes();

    if (min < 10) {
      min = '0' + min;
    }

    return day + ':' + min;
  };

  var createMessage = function createMessage(str) {
    var message = document.createElement('div');
    $(message).addClass('chat-message');

    message.innerHTML = str;

    return message;
  };

  var createHeader = function createHeader(name, date) {
    var header = document.createElement('div');
    $(header).addClass('chat-header');

    var sender = document.createElement('span');
    $(sender).addClass('chat-message-sender');
    $(sender).text(name);
    var time = document.createElement('span');
    $(time).addClass('chat-message-timestamp');
    $(time).text(formatDate(date));

    header.appendChild(sender);
    header.appendChild(time);
    return header;
  };

  if (!window.FTW) {
    throw new Error('FTW object not loaded');
  }

  if (!window.FTW.chat) {
    var chat = {};

    chat.ignoreList = new Set();

    chat.previousSender = '';

    chat.appendMessage = function addMessageToChat(msg) {
      var user = msg.from;
      var str = msg.message;
      var type = msg.type;


      if (this.ignoreList.has(user)) {
        return;
      }

      var isNewSender = user !== chat.previousSender;

      var message = document.createElement('div');
      $(message).addClass('chat-item');

      if (type === 'private') {
        $(message).addClass('chat-pm');
      }

      var gutter = document.createElement('span');
      $(gutter).addClass('chat-message-gutter');

      if (isNewSender) {
        var pfp = document.createElement('canvas');
        $(pfp).addClass('pfp');
        $(pfp).attr('data-jdenticon-value', user);
        $(pfp).attr('width', '50');
        $(pfp).attr('height', '50');
        jdenticon.update(pfp);

        var container = document.createElement('div');
        $(container).addClass('image-container');

        container.appendChild(pfp);
        gutter.appendChild(container);
      }

      message.appendChild(gutter);

      var body = document.createElement('span');
      $(body).addClass('chat-message-body');

      if (isNewSender) {
        body.appendChild(createHeader(user, new Date()));
      }

      body.appendChild(createMessage(str));

      message.appendChild(body);

      $('#chat-display').append(message);

      chat.previousSender = user;
    };

    chat.safeAppend = function (msg) {
      var scrollDiff = $('#chat-display').prop('scrollHeight') - $('#chat-display').prop('scrollTop') - $('#chat-display').height();

      window.FTW.chat.appendMessage(msg);

      $('#chat-display').stop(true, true);

      if (scrollDiff < 10) {
        $('#chat-display').prop('scrollTop', $('#chat-display').prop('scrollHeight'));
      }
    };

    // Emoji auto-complete
    var tempInput = '';

    $('#chat-box').autocomplete({
      source: function source(request, response) {
        var match = request.term.match(/:([a-z0-9+\-_]*?)$/);

        if (match && !/:([a-z0-9+\-_]*?):$/.test(request.term)) {
          response(emojies.filter(function (emoji) {
            return emoji.startsWith(match[1]);
          }).slice(0, 5)
          // eslint-disable-next-line arrow-body-style
          .map(function (emoji) {
            return {
              label: '<img class="emoji" src="/emoji/' + emoji + '.png" title="' + emoji + '" alt=":' + emoji + ':" /> :' + emoji + ':',
              value: emoji
            };
          }));

          tempInput = request.term;
        } else {
          response([]);
        }
      },


      position: { my: 'left bottom', at: 'left top', collision: 'flip' },

      open: function open() {
        var $labels = $('#chat-box').autocomplete('widget').children().children();

        $labels.html(function (i) {
          return $labels[i].innerText;
        });
      },
      select: function select(event, ui) {
        $('#chat-box').val(tempInput.replace(/:([a-z0-9+\-_]*?)$/, ':' + ui.item.value + ':'));

        event.stopPropagation();
        event.preventDefault();
      },
      focus: function focus(event, ui) {
        $('#chat-box').val(tempInput.replace(/:([a-z0-9+\-_]*?)$/, ':' + ui.item.value + ':'));

        event.stopPropagation();
        event.preventDefault();
      }
    });

    /* textcomplete.register(
      [
        {
          id: 'emoji',
          match: /\B:([-+\w]*)$/,
            search(term, callback) {
            callback(emojies.filter(emoji => emoji.startsWith(term)));
          },
            template(value) {
            return `<img class="emoji" src="/emoji/${value}.png" title="${value}" alt=":${value}:" />`;
          },
            replace(value) {
            return `:${value}:`;
          },
            index: 1,
        },
      ],
        {
        onKeydown(e, commands) {
          if (e.ctrlKey && e.keyCode === 74) { // CTRL-J
            return commands.KEY_ENTER;
          }
            return null;
        },
      },
    ); */

    $('#chat-box').keypress(function (e) {
      if (e.which === 13) {
        var message = $('#chat-box').val();
        message = message.trim();

        if (message !== '') {
          if (message.charAt(0) === '/') {
            window.FTW.cmd.exec(message.substring(1));
          } else {
            window.FTW.socket.emit('public message', message);
          }
        }

        $('#chat-box').val('');
      }
    });

    window.FTW.chat = chat;
  }
});
//# sourceMappingURL=chat.js.map