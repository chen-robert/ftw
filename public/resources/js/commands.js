$(document).ready(function () {
  "use strict";

  if (window.FTW && !window.FTW.cmd) {
    const cmd = {};
    cmd.exec = function (str) {
      if (str.length == 0) {
        return;
      }
      const parts = str.split(" ");
      const cmd = parts.splice(0, 1)[0];

      switch (cmd) {
        case "help":
          this.send("/help : Get help!");
          this.send("/cc : Clear chat!");
          this.send("/ignore : Ignore / unignore somebody!");
          this.send("/msg : Private messages!");
          this.send("/stas : Get somebody's stats")
          break;
        case "cc":
          $("#chat-display").empty();
          window.FTW.chat.previousSender = "";
          break;
        case "ignore":
          if (parts.length > 0) {
            const name = parts[0];
            if (window.FTW.chat.ignoreList.has(name)) {
              window.FTW.chat.ignoreList.delete(name);
              this.send(name + " is no longer ignored!");
            } else {
              window.FTW.chat.ignoreList.add(name);
              this.send(name + " is now ignored!");
            }
          } else {
            this.send("Please specify somebody to ignore! /ignore [name] ")
          }
          break;
        case "w":
        case "msg":
          if (parts.length >= 2) {
            const to = parts.splice(0, 1)[0];
            window.FTW.socket.emit("whisper", {
              to: to,
              message: parts.join(" ")
            });
          } else {
            this.send("Please use /" + cmd + " [name] [msg]");
          }
          break;
        case "stats":
          const _self = this;
          if (parts.length >= 1) {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
              if (this.readyState == 4 && this.status == 200) {
                const response = JSON.parse(this.responseText);
                if (response.error) {
                  _self.send(response.error);
                } else {
                  console.log(this)
                  _self.send(`${response.username} has rating ${response.rating}`);
                  _self.send(`They also have ${response.wins} wins out of ${response.games} games played.`);
                }
              }
            };
            xhttp.open("GET", "/stats/" + parts[0], true);
            xhttp.send();
          } else {
            this.send("Please specify a username");
          }
          break;
        default:
          this.send("Unknown command. Do /help for help.");
          break;
      }

    }
    cmd.send = function (msg) {
      window.FTW.chat.safeAppend({
        from: "Ftw Bot",
        message: msg,
        type: "system"
      });
    }

    window.FTW.cmd = cmd;
  }
});
