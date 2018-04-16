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
                    break;
                case "cc":
                    $("#chat-display").empty();
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
