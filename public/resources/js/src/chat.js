/* eslint-env browser, jquery */
/* globals jdenticon, emojies */
$(document).ready(() => {
  const formatDate = function getPrettyDate(date) {
    const day = date.getHours();
    let min = date.getMinutes();

    if (min < 10) {
      min = `0${min}`;
    }

    return `${day}:${min}`;
  };

  const createMessage = (str) => {
    const message = document.createElement('div');
    $(message).addClass('chat-message');

    message.innerHTML = str;

    return message;
  };

  const createHeader = (name, date) => {
    const header = document.createElement('div');
    $(header).addClass('chat-header');

    const sender = document.createElement('span');
    $(sender).addClass('chat-message-sender');
    $(sender).text(name);
    const time = document.createElement('span');
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
    const chat = {};

    chat.ignoreList = new Set();

    chat.previousSender = '';

    chat.appendMessage = function addMessageToChat(msg) {
      const user = msg.from;
      const str = msg.message;
      const { type } = msg;

      if (this.ignoreList.has(user)) {
        return;
      }

      const isNewSender = user !== chat.previousSender;

      const message = document.createElement('div');
      $(message).addClass('chat-item');

      if (type === 'private') {
        $(message).addClass('chat-pm');
      }


      const gutter = document.createElement('span');
      $(gutter).addClass('chat-message-gutter');

      if (isNewSender) {
        const pfp = document.createElement('canvas');
        $(pfp).addClass('pfp');
        $(pfp).attr('data-jdenticon-value', user);
        $(pfp).attr('width', '50');
        $(pfp).attr('height', '50');
        jdenticon.update(pfp);

        const container = document.createElement('div');
        $(container).addClass('image-container');


        container.appendChild(pfp);
        gutter.appendChild(container);
      }

      message.appendChild(gutter);

      const body = document.createElement('span');
      $(body).addClass('chat-message-body');

      if (isNewSender) {
        body.appendChild(createHeader(user, new Date()));
      }

      body.appendChild(createMessage(str));

      message.appendChild(body);

      $('#chat-display').append(message);

      chat.previousSender = user;
    };

    chat.safeAppend = (msg) => {
      const scrollDiff = $('#chat-display').prop('scrollHeight')
        - $('#chat-display').prop('scrollTop')
        - $('#chat-display').height();

      window.FTW.chat.appendMessage(msg);

      $('#chat-display').stop(true, true);

      if (scrollDiff < 10) {
        $('#chat-display').prop('scrollTop', $('#chat-display').prop('scrollHeight'));
      }
    };

    // Emoji auto-complete
    let tempInput = '';

    $('#chat-box').autocomplete({
      source(request, response) {
        const match = request.term.match(/:([a-z0-9+\-_]*?)$/);

        if (match && !/:([a-z0-9+\-_]*?):$/.test(request.term)) {
          response(emojies
            .filter(emoji => emoji.startsWith(match[1]))
            .slice(0, 5)
            // eslint-disable-next-line arrow-body-style
            .map((emoji) => {
              return {
                label: `<img class="emoji" src="/emoji/${emoji}.png" title="${emoji}" alt=":${emoji}:" /> :${emoji}:`,
                value: emoji,
              };
            }));

          tempInput = request.term;
        } else {
          response([]);
        }
      },

      position: { my: 'left bottom', at: 'left top', collision: 'flip' },

      open() {
        const $labels = $('#chat-box').autocomplete('widget').children().children();

        $labels.html(i => $labels[i].innerText);
      },

      select(event, ui) {
        $('#chat-box').val(tempInput.replace(/:([a-z0-9+\-_]*?)$/, `:${ui.item.value}:`));

        event.stopPropagation();
        event.preventDefault();
      },

      focus(event, ui) {
        $('#chat-box').val(tempInput.replace(/:([a-z0-9+\-_]*?)$/, `:${ui.item.value}:`));

        event.stopPropagation();
        event.preventDefault();
      },
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

    $('#chat-box').keypress((e) => {
      if (e.which === 13) {
        let message = $('#chat-box').val();
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
