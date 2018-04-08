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
            return false;
        }
        this.users.splice(this.users.indexOf(data), 1);

        if (this.users.length == 0) return false;
        if (this.host === data) {
            this.host = this.users[0];
        }
        return true;
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

        const games = this.games;

        const removeUser = function () {
            if (userData.game) {
                //Clean up the game if we return false
                if (userData.game.remove(socket)) {
                    this.games.delete(userData.game.id);
                }
                userData.game = null;
            }
        }
        const joinGame = function (id) {
            if (games.has(id)) {
                userData.game = games.get(id);

                games.get(id).add(socket);
            }
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
        io.emit("game data", this);
    }
}

module.exports = new GameManager();
