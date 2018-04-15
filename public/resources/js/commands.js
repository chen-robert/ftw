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
                    break;
                case "cc":
                    $("#chat-display").empty();
                    break;
                default:
                    this.send("Unknown command. Do /help for help.");
                    break;
            }

        }
        cmd.send = function (msg) {
            window.FTW.chat.appendMessage("Ftw Bot", msg);
        }

        window.FTW.cmd = cmd;
    }
});
