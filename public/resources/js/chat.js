$(document).ready(function () {
    'use strict';

    if (!window.FTW) {
        throw new Error("FTW object not loaded");
    }

    if (!window.FTW.chat) {
        var chat = {};


        chat.appendMessage = function (user, str) {
            
        };




        window.FTW.chat = chat;
    }
});
