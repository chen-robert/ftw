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
            $("#create-game-model").modal("toggle");
        });

        $("#leave-game-button").click(() => window.FTW.socket.emit("leave game"));
        $("#start-game-button").click(() => {
            window.FTW.socket.emit("start game");
            $("#start-game-button").hide();
        });
        $("#answer-box").keypress(function (e) {
            if (e.which == 13) {
                window.FTW.socket.emit("answer", $("#answer-box").val());
                $("#answer-box").val("");
                $("#answer-box").hide();
            }
        });
        const game = {};

        game.leaveGame = function () {
            $("#problem-box").hide();
            $("#start-game-button").hide();
            $("#leave-game-button").hide();

            $("#game-display").show();
            $("#create-game-button").show();

            $("#problem-header").text("Waiting to start...");
            $("#problem-text").text("");

        }
        game.joinGame = function () {
            $("#problem-box").show();
            $("#start-game-button").show();
            $("#leave-game-button").show();

            $("#game-display").hide();
            $("#create-game-button").hide();

            $("#answer-box").hide();
        }
        game.setTimer = function (params) {
            $("#problem-header").text(params.type);
            $("#timer").stop(true, true);
            $("#timer").css("width", "");
            $("#timer").animate({
                width: "100%"
            }, params.time * 1000);

            $("#answer-box").hide();
        }
        game.setProblem = function (problem) {
            console.log("==== Problem Data ====");
            console.log(problem);

            $("#problem-text").text(problem.text);

            $("#answer-box").show();
        }

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
                $(header).addClass("game-disp-header");
                $(header).text(data.host.username);

                const body = document.createElement("div");
                $(body).addClass("game-disp-body");
                $(body).append("<strong>Players: " + data.users.length + "</strong>");

                const footer = document.createElement("div");
                $(footer).addClass("game-disp-footer");

                box.appendChild(header);
                box.appendChild(body);
                box.appendChild(footer);

                $(box).click(function () {
                    window.FTW.socket.emit("join game", uuid);
                });

                $("#game-display").append(box);

            }
        }


        window.FTW.game = game;
    }
})();
