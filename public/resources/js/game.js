(function () {
    "use strict";
    if (window.FTW && !window.FTW.game) {
        //This is the button that appears on the nav
        $("#create-game-button").click(function () {
            $("#create-game-model").modal("toggle");
        });
        //This is the button that appears in the modal box.
        $("#create-game").click(function () {
            window.FTW.socket.emit("create game", {
                time: $("#create-time").val(),
                problems: $("#create-problem-count").val()
            });
        });

        const game = {};

        game.joinGame(function (uuid) {
            window.FTW.socket.emit("join game", uuid);
        })

        game.loadGames = function (dataObj) {
            $("#game-display").empty();

            //Regenerate all games. This sacrifices efficiency for simplicity.
            for (var uuid in dataObj) {
                const data = dataObj[uuid];
                //This means data is still in process of being finalized.
                if (data.host === null) {
                    continue;
                }

                const box = document.createElement("div");
                $(box).addClass("game-box");

                const header = document.createElement("div");
                $(header).addClass("game-header");
                $(header).text(data.host.username);

                const body = document.createElement("div");
                $(body).addClass("game-body");
                $(body).append("<strong>Players: " + data.users.length + "</strong>");

                const footer = document.createElement("div");
                $(footer).addClass("game-footer");

                box.appendChild(header);
                box.appendChild(body);
                box.appendChild(footer);

                $(box).click(function () {
                    game.joinGame(uuid);
                });

                $("#game-display").append(box);
            }
        }


        window.FTW.game = game;
    }
})();
