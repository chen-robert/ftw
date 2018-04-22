/* eslint-env browser, jquery */
/* globals jdenticon */
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
      const scrollDiff = $('#chat-display').prop('scrollHeight') - $('#chat-display').prop('scrollTop') - $('#chat-display').height();

      window.FTW.chat.appendMessage(msg);

      $('#chat-display').stop(true, true);

      if (scrollDiff < 10) {
        $('#chat-display').prop('scrollTop', $('#chat-display').prop('scrollHeight'));
      }
    };

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
