"use strict";

const uuidv1 = require('uuid/v1');
const problemUtils = require("./problemUtils");

class Game {

    constructor(timePerProblem, problems) {
        this.users = [];
        //This won't be transfered because map's can't be serialized.
        this.dataToSocket = new Map();

        this.id = uuidv1();
        this.host = null;

        this.started = false;
        this.timePerProblem = +timePerProblem;
        this.problems = +problems;

        this.currProblem = {};
    }
    add(data, socket) {
        if (this.host === null) {
            this.host = data;
        }
        if (this.users.indexOf(data) == -1) {
            this.users.push(data);
            this.dataToSocket.set(data, socket);
        }
        data.score = 0;

        this.sendScores();
    }

    remove(data) {
        if (this.users.indexOf(data) == -1) {
            console.error("Tried to delete somebody that didn't exist in game.");
            return true;
        }
        this.dataToSocket.delete(data);
        this.users.splice(this.users.indexOf(data), 1);

        this.sendScores();
        //If the room would be empty, we'll delete it
        if (this.users.length == 0) return true;
        if (this.host === data) {
            this.host = this.users[0];
        }
        return false;
    }

    start() {
        if (this.started) return;

        this.started = true;

        this.users.forEach((user) => {
            user.canAnswer = false;
            user.score = 0;
        });
        this.dataToSocket.forEach((socket) => socket.emit("timer", {
            type: "Starting",
            time: 5
        }));
        let time = 5;

        this.functionArr = [];
        this.arrIndex = -1;
        const _self = this;
        setTimeout(() => _self.safeProgress(0), 5 * 1000);

        for (let i = 0; i < this.problems; i++) {
            this.functionArr.push(function () {
                _self.users.forEach((user) => user.canAnswer = true);

                const problem = problemUtils.getProblem();
                _self.currProblem = problem;

                //Order of these emits matters. 
                _self.dataToSocket.forEach((socket) => socket.emit("timer", {
                    type: "Problem #" + (i + 1),
                    time: _self.timePerProblem
                }));

                _self.dataToSocket.forEach((socket) => socket.emit("problem", {
                    text: problem.text,
                    answer: "0x536865727279"
                }));

                setTimeout(() => _self.safeProgress(2 * i + 1), _self.timePerProblem * 1000);
            });

            if (i != this.problems - 1) {
                this.functionArr.push(function () {
                    _self.users.forEach((user) => user.canAnswer = false);
                    //Reason why these are reversed from above is because game hides / shows the answer
                    //box based on order of these emits.
                    _self.dataToSocket.forEach((socket) => socket.emit("problem", {
                        text: "Something here? I guess.",
                        answer: "0x536865727279"
                    }));
                    _self.dataToSocket.forEach((socket) => socket.emit("timer", {
                        type: "Intermission",
                        time: 5
                    }));
                    _self.sendScores();
                    setTimeout(() => _self.safeProgress(2 * i + 2), 5 * 1000);
                });
            }
        }
        this.functionArr.push(function () {
            _self.dataToSocket.forEach((socket) => socket.emit("problem", {
                text: "It's over! Finally!",
                answer: "0x536865727279"
            }));

            _self.dataToSocket.forEach((socket) => socket.emit("timer", {
                type: "Round Over",
                time: 0
            }));
        });


    }
    //Safely progress to the next part of the game.
    safeProgress(expected) {
        if (this.arrIndex + 1 !== expected) return;
        this.arrIndex++;
        const nextFunc = this.functionArr[this.arrIndex];
        nextFunc();
    }

    //Send scores to everybody
    sendScores() {
        //Lazy implementation, but we can afford sending extra data
        this.dataToSocket.forEach((socket) => socket.emit("scores", this.users));
    }

    answer(user, answer) {
        if (user.canAnswer) {
            user.canAnswer = false;

            if (answer === this.currProblem.answer) {
                user.score++;
            }
            if (this.users.filter((user) => user.canAnswer).length == 0) {
                this.safeProgress(this.arrIndex + 1);
            }
        }
    }



}
class GameManager {
    constructor(io) {
        this.games = new Map();
        this.io = io;
    }
    addSocket(data, socket) {
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

                games.get(id).add(userData, socket);
                socket.emit("join game");
            }
            updateData();
        }
        const startGame = function () {
            if (currGame) {
                currGame.start();
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
            const game = new Game(data.time, data.problems);
            games.set(game.id, game);

            joinGame(game.id);
        });
        socket.on("answer", answerProblem);
        socket.on("start game", startGame);

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
