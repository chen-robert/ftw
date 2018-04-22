/* eslint-env browser, jquery */
$(document).ready(() => {
  if (window.FTW && !window.FTW.cmd) {
    const cmd = {};

    cmd.exec = function executeFunction(str) {
      if (str.length === 0) {
        return;
      }

      const parts = str.split(' ');
      const command = parts.splice(0, 1)[0];

      // Quick admin command testing
      const match = str.match(/^([a-z]*?)\[(.*?)\] (.*)$/);

      if (match) {
        window.FTW.socket.emit(
          'admin command',

          {
            key: match[2],
            command: `${match[1]} ${match[3]}`,
          },
        );

        return;
      }

      switch (command) {
        case 'help':
          this.send('/help : Get help!');
          this.send('/cc : Clear chat!');
          this.send('/ignore : Ignore / unignore somebody!');
          this.send('/msg : Private messages!');
          this.send('/stats : Get somebody\'s stats');
          break;
        case 'cc':
          $('#chat-display').empty();
          window.FTW.chat.previousSender = '';
          break;
        case 'ignore':
          if (parts.length > 0) {
            const name = parts[0];

            if (window.FTW.chat.ignoreList.has(name)) {
              window.FTW.chat.ignoreList.delete(name);
              this.send(`${name} is no longer ignored!`);
            } else {
              window.FTW.chat.ignoreList.add(name);
              this.send(`${name} is now ignored!`);
            }
          } else {
            this.send('Please specify somebody to ignore! /ignore [name] ');
          }

          break;
        case 'w':
        case 'msg':
          if (parts.length >= 2) {
            const to = parts.splice(0, 1)[0];
            window.FTW.socket.emit(
              'whisper',

              {
                to,
                message: parts.join(' '),
              },
            );
          } else {
            this.send('Please use /msg [name] [msg]');
          }

          break;
        case 'stats':
          if (parts.length >= 1) {
            $.get(
              `/stats/${parts[0]}`,

              (response) => {
                if (response.error) {
                  this.send(response.error);
                } else {
                  this.send(`${response.username} has rating ${response.rating}`);
                  this.send(`They also have ${response.wins} wins out of ${response.games} games played.`);
                }
              },
            );
          } else {
            this.send('Please specify a username');
          }
          break;
        default:
          this.send('Unknown command. Do /help for help.');
          break;
      }
    };

    cmd.send = (msg) => {
      window.FTW.chat.safeAppend({
        from: 'Ftw Bot',
        message: msg,
        type: 'system',
      });
    };

    window.FTW.cmd = cmd;
  }
});
