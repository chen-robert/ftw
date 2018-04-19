const chatUtils = require('./chatUtils.js');
const chatLog = require('./chatLog.js');

const emoji = require('emoji-parser');

emoji.init().update();

const swearList = require('swearjar');

const moment = require('moment');

class ChatManager {
  constructor() {
    this.users = new Map();
    this.muted = new Set();
  }

  addUser(data, socket) {
    const name = data.username;
    const { users } = this;

    if (users.has(name)) {
      this.disconnect(name);
    }

    users.set(name, { socket, data });

    socket.on(
      'public message',

      (message) => {
        if (this.muted.has(name)) {
          return;
        }

        const msg = this.process(message);

        if (typeof msg === 'string') {
          users.forEach(usrdata => usrdata.socket.emit(
            'message',

            {
              type: 'public',
              from: name,
              message: msg,
            },
          ));

          // Add to chat log
          chatLog.create({
            date: moment().format('YYYY-MM-DD'),
            time: moment().format('HH:mm:ss'),
            username: name,
            message: msg,
          });
        }
      },
    );

    socket.on(
      'whisper',

      (whisper) => {
        if (this.muted.has(name)) {
          return;
        }

        const { to } = whisper;
        let { message } = whisper;
        message = this.process(message);

        if (typeof message === 'string' && typeof to === 'string') {
          if (this.users.has(to)) {
            const msg = {
              message,
              type: 'private',
              from: name,
            };

            this.users.get(to).socket.emit('message', msg);
            socket.emit('message', msg);
          } else {
            socket.emit(
              'message',

              {
                type: 'public',
                from: 'Ftw Bot',
                message: 'Username not found',
              },
            );
          }
        }
      },
    );

    socket.on(
      'admin command',

      (cmd) => {
        if (cmd.key === process.env.ADMIN_PASSWORD && typeof cmd.command === 'string') {
          console.log(`${name} executed ${cmd.command}`);
          const parts = cmd.command.split(' ');
          if (parts.length === 2) {
            if (parts[0] === 'kick') {
              this.disconnect(parts[1]);
            } else if (parts[0] === 'mute') {
              this.muted.add(parts[1]);

              socket.emit(
                'message',

                {
                  type: 'public',
                  from: 'Ftw Bot',
                  message: `${parts[1]} is now muted!`,
                },
              );
            } else if (parts[0] === 'unmute') {
              this.muted.delete(parts[1]);

              socket.emit(
                'message',

                {
                  type: 'public',
                  from: 'Ftw Bot',
                  message: `${parts[1]} is no longer muted!`,
                },
              );
            }
          }
        } else {
          console.error(`${name} tried executing ${data.command} with key ${data.key}`);
        }
      },
    );
  }

  get onlineUsers() {
    const pool = [];
    this.users.forEach(data => pool.push(data.data));
    return pool;
  }

  disconnect(name) {
    if (this.users.has(name)) {
      this.users.get(name).socket.emit('redirect', '/logout');
      this.users.get(name).socket.disconnect();
    }
  }

  /* eslint-disable class-methods-use-this */
  process(message) {
    if (typeof message !== 'string') {
      return null;
    }

    let msg = message.trim();

    if (msg.length === 0 || message.length > 120) {
      return null;
    }

    msg = swearList.censor(message);
    msg = chatUtils.clean(message);
    msg = chatUtils.parseLinks(message);
    msg = emoji.parse(message, '/emoji');
    return message;
  }
}

module.exports = new ChatManager();
