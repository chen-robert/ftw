"use strict";

const uuidv1 = require('uuid/v1');

class Game {

    constructor() {
        this.users = [];
        this.id = uuidv1();
        this.host = null;
    }
    add(data) {
        if (this.host === null) {
            this.host = data;
        }
        this.users.push(data);
    }

    remove(data) {
        if (this.users.indexOf(data) == -1) {
            console.error("Tried to delete somebody that didn't exist in game.");
            return true;
        }
        this.users.splice(this.users.indexOf(data), 1);

        console.log("Removed " + data);
        //If the room would be empty, we'll delete it
        if (this.users.length == 0) return true;
        if (this.host === data) {
            this.host = this.users[0];
        }
        return false;
    }

}
class GameManager {
    constructor(io) {
        this.games = new Map();
        this.io = io;
    }
    addSocket(data, socket) {
        //Locally scoped because it won't need to be accessed anywhere else
        const userData = data;
        let currGame = null;

        const games = this.games;
        const _self = this;

        const removeUser = function () {
            if (currGame) {
                //Clean up the game if we return false
                if (currGame.remove(userData)) {
                    games.delete(currGame.id);
                }
                currGame = null;
            }
            _self.updateData();
        }
        const joinGame = function (id) {
            if (games.has(id)) {
                if (currGame !== null) {
                    removeUser();
                }
                currGame = games.get(id);

                games.get(id).add(userData);
            }
            _self.updateData();
        }

        socket.on("disconnect", removeUser);
        socket.on("leave", removeUser);
        socket.on("join game", joinGame);
        socket.on("create game", function () {
            const game = new Game();
            games.set(game.id, game);

            joinGame(game.id);
        });

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
