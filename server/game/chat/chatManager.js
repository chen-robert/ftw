const chatUtils = require('./chatUtils.js');
const chatLog = require('./chatLog.js');
const moment = require('moment');

const emoji = require('emoji-parser');

emoji.init().update();

const swearList = require('swearjar');

class ChatManager {
  constructor() {
    this.users = new Map();
    this.ips = new Map();

    // Stores lowerCaseString -> string for PM functions. This code seems really ugly.
    this.nameMap = new Map();

    this.muted = new Set();
    this.banned = new Set();
  }

  addUser(data, socket, ip) {
    const name = data.username;
    const nameLower = name.toLowerCase();
    const { users } = this;

    // Set IP data
    this.ips.set(name, ip);

    this.nameMap.set(nameLower, name);

    if (users.has(name)) {
      this.disconnect(name);
    }

    if (this.banned.has(name) || this.banned.has(ip)) {
      socket.emit('redirect', '/logout');
      socket.disconnect();
      return;
    }

    users.set(name, { socket, data, queue: [] });

    const rateLimit = [];

    socket.on(
      'public message',

      (message) => {
        if (this.muted.has(name)) {
          return;
        }

        const currTime = new Date().getTime();

        while (rateLimit.length > 0 && rateLimit[0] < currTime - (5 * 1000)) {
          rateLimit.shift();
        }

        rateLimit.push(currTime);

        if (rateLimit.length > 5) {
          socket.emit('message', ChatManager.toMessage('Please slow down!'));
        } else {
          const msg = ChatManager.process(message);

          if (typeof msg === 'string') {
            users.forEach((usrdata, username) => {
              // Only send message if chat not frozen
              if (!usrdata.socket.adapter.rooms.frozen) {
                usrdata.socket.emit(
                  'message',

                  {
                    type: 'public',
                    from: name,
                    message: msg,
                  },
                );
              } else {
                users.set(
                  username,

                  {
                    socket: usrdata.socket,
                    data: usrdata.data,

                    queue: usrdata.queue.concat([
                      {
                        type: 'public',
                        from: name,
                        message: msg,
                      },
                    ]),
                  },
                );
              }
            });

            // Add to chat log
            chatLog.create({
              date: moment().format('YYYY-MM-DD'),
              time: moment().format('HH:mm:ss'),
              username: name,
              message: msg,
            });
          }
        }
      },
    );

    socket.on(
      'whisper',

      (whisper) => {
        if (this.muted.has(name)) {
          return;
        }

        let { message, to } = whisper;
        message = ChatManager.process(message);

        if (typeof message === 'string' && typeof to === 'string') {
          to = this.nameMap.get(to.toLowerCase());

          if (this.users.has(to)) {
            const msg = {
              message,
              type: 'private',
              from: name,
            };

            this.users.get(to).socket.emit('message', msg);
            socket.emit('message', msg);
          } else {
            socket.emit('message', ChatManager.toMessage('Username not found'));
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
            } else if (parts[0] === 'ip') {
              if (this.ips.has(parts[1])) {
                socket.emit('message', ChatManager.toMessage(`${parts[1]} has IP ${this.ips.get(parts[1])}`));
              } else {
                socket.emit('message', ChatManager.toMessage(`Unable to get IP of ${parts[1]}`));
              }
            } else if (parts[0] === 'mute') {
              this.muted.add(parts[1]);
              socket.emit('message', ChatManager.toMessage(`${parts[1]} is now muted!`));
            } else if (parts[0] === 'unmute') {
              this.muted.delete(parts[1]);
              socket.emit('message', ChatManager.toMessage(`${parts[1]} is no longer muted!`));
            } else if (parts[0] === 'ban') {
              this.banned.add(parts[1]);
              this.disconnect(parts[1]);

              socket.emit('message', ChatManager.toMessage(`${parts[1]} is now banned!`));
            } else if (parts[0] === 'unban') {
              this.banned.delete(parts[1]);

              socket.emit('message', ChatManager.toMessage(`${parts[1]} is no longer banned!`));
            } else if (parts[0] === 'restart') {
              users.forEach(usrdata => usrdata.socket.emit('notif error', 'Server Restarting'));
            }
          }
        } else {
          console.error(`${name} tried executing ${cmd.command} with key ${cmd.key}`);
        }
      },
    );
  }

  onlineUsers() {
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

  static process(message) {
    if (typeof message !== 'string') {
      return null;
    }

    let msg = message.trim();

    if (msg.length === 0 || msg.length > 120) {
      return null;
    }

    msg = swearList.censor(msg);
    msg = chatUtils.clean(msg);
    msg = chatUtils.parseLinks(msg);
    msg = emoji.parse(msg, '/emoji');
    return msg;
  }

  static toMessage(str) {
    return {
      type: 'public',
      from: 'Console',
      message: str,
    };
  }
}

module.exports = new ChatManager();
