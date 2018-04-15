$(document).ready(function () {
    "use strict";

    function formatDate(date) {

        let day = date.getHours();
        let min = date.getMinutes();

        if (min < 10) min = "0" + min;
        return day + ":" + min;
    }

    if (!window.FTW) {
        throw new Error("FTW object not loaded");
    }

    if (!window.FTW.chat) {
        const chat = {};

        chat.previousSender = "";

        function createMessage(str) {
            var message = document.createElement("div");
            $(message).addClass("chat-message");

            message.innerHTML = str;


            return message;
        }

        function createHeader(name, date) {
            var header = document.createElement("div");
            $(header).addClass("chat-header");

            var sender = document.createElement("span");
            $(sender).addClass("chat-message-sender");
            $(sender).text(name);
            var time = document.createElement("span");
            $(time).addClass("chat-message-timestamp");
            $(time).text(formatDate(date));

            header.appendChild(sender);
            header.appendChild(time);
            return header;
        }

        chat.appendMessage = function (user, str) {
            let isNewSender = user !== chat.previousSender;

            let message = document.createElement("div");
            $(message).addClass("chat-item");


            let gutter = document.createElement("span");
            $(gutter).addClass("chat-message-gutter");
            if (isNewSender) {
                let pfp = document.createElement("canvas");
                $(pfp).addClass("pfp");
                $(pfp).attr("data-jdenticon-value", user);
                $(pfp).attr("width", "50");
                $(pfp).attr("height", "50");
                jdenticon.update(pfp);

                let container = document.createElement("div");
                $(container).addClass("image-container");


                container.appendChild(pfp);
                gutter.appendChild(container);

            }
            message.appendChild(gutter);

            let body = document.createElement("span");
            $(body).addClass("chat-message-body");
            if (isNewSender) {
                body.appendChild(createHeader(user, new Date()));
            }
            body.appendChild(createMessage(str));

            message.appendChild(body);

            $("#chat-display").append(message);

            chat.previousSender = user;
        };

        $("#chat-box").keypress(function (e) {
            if (e.which == 13) {
                let message = $("#chat-box").val();
                message = message.trim();
                if (message !== "") {
                    if (message.charAt(0) === "/") {
                        window.FTW.cmd.exec(message.substring(1));
                    } else {
                        window.FTW.socket.emit("public message", message);
                    }
                }
                $("#chat-box").val("");
            }
        });


        window.FTW.chat = chat;
    }
});
