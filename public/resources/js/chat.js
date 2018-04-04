$(document).ready(function () {
    "use strict";

    function formatDate(date) {
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"];

        var day = date.getDate();
        var monthIndex = date.getMonth();

        return day + " " + monthNames[monthIndex];
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

            var text = document.createElement("span");
            $(text).text(str);

            message.appendChild(text);
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


            let gutter = document.createElement("div");
            $(gutter).addClass("chat-message-gutter");
            if (isNewSender) {
                let pfp = document.createElement("img");
                pfp.src = "resources/images/default.png";
                $(pfp).addClass("pfp");
                $(pfp).addClass("rounded-circle");
                gutter.appendChild(pfp);
            }
            message.appendChild(gutter);

            let body = document.createElement("div");
            $(body).addClass("chat-message-body");
            if (isNewSender) {
                body.appendChild(createHeader(user, new Date()));
            }
            body.appendChild(createMessage(str));

            message.appendChild(body);

            $("#chat-display").append(message);

            chat.previousSender = user;
        };




        window.FTW.chat = chat;
    }
});
