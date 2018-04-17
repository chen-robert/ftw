"use strict";

const Game = require("./game.js");

class GameManager {
    constructor(io) {
        this.games = new Map();
        this.io = io;
    }
    //Passing updateAllUsers around seems like spaghetti code
    addSocket(data, socket, updateAllUsers) {
        //Locally scoped because it won't need to be accessed anywhere else
        const userData = {
            username: data.username,
            rating: data.rating
        };
        let currGame = null;

        const games = this.games;
        const _self = this;

        //Update self first, then everybody
        const updateData = function () {
            socket.emit("curr game", currGame && currGame.id || "lobby");
            _self.updateData();
        }
        const removeUser = function () {
            if (currGame) {
                //Clean up the game if we return false
                if (currGame.remove(userData)) {
                    games.delete(currGame.id);
                }
                currGame = null;
                socket.emit("leave game");
            }
            updateData();
        }
        const joinGame = function (id) {
            if (games.has(id) && !games.get(id).started) {
                if (currGame !== null && currGame.id !== id) {
                    removeUser();
                }
                currGame = games.get(id);

                games.get(id).add(userData, socket, data);
                socket.emit("join game");
            }
            updateData();
        }
        const startGame = function () {
            if (currGame) {
                currGame.start(() => updateAllUsers());
                updateData();
            }
        }
        const answerProblem = function (answer) {
            if (currGame === null || !currGame.started) {
                console.error(userData.username + " is trying to pull something funny.");
            } else {
                currGame.answer(userData, answer);
            }
        }

        socket.on("disconnect", removeUser);
        socket.on("leave game", removeUser);
        socket.on("join game", joinGame);
        socket.on("create game", function (data) {
            let time = +data.time;
            let problems = +data.problems;

            problems = Math.floor(problems);
            if (time > 0 && problems > 0 && time < 1000 && problems < 1000) {

                if (data.type === "FTW" || data.type === "CD") {
                    //CD defaults
                    if (data.type === "CD") {
                        problems = 100;
                        time = 45;
                    }
                    const game = new Game(time, problems, data.type);
                    games.set(game.id, game);

                    joinGame(game.id);
                }
            }

        });
        socket.on("answer", answerProblem);
        socket.on("start game", startGame);

        updateData();
    }
    //Serializing the entire class is probably less error prone for now. This could 
    //pose problems later however.
    updateData() {
        const ret = {};
        this.games.forEach((val, key) => ret[key] = val);
        this.io.emit("game data", ret);
    }
}

module.exports = function (io) {
    return new GameManager(io);
}
