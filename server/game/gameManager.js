const Game = require('./game.js');

class GameManager {
  constructor(io) {
    this.games = new Map();
    this.io = io;
  }

  // Passing updateAllUsers around seems like spaghetti code
  addSocket(data, socket, updateAllUsers) {
    // Locally scoped because it won't need to be accessed anywhere else
    const userData = {
      username: data.username,
      rating: data.rating,
    };

    let currGame = null;

    const { games } = this;

    // Update self first, then everybody
    const updateData = () => {
      socket.emit('curr game', (currGame && currGame.id) || 'lobby');
      this.updateData();
    };

    const removeUser = () => {
      if (currGame) {
        // Clean up the game if we return false
        if (currGame.remove(userData)) {
          games.delete(currGame.id);
        }

        currGame = null;
        socket.emit('leave game');
      }

      updateData();
    };

    const joinGame = (funcData) => {
      const { id, pw } = funcData;

      if (games.has(id) && !games.get(id).started) {
        if (currGame !== null && currGame.id !== id) {
          removeUser();
        }

        currGame = games.get(id);

        if (games.get(id).pw === pw) {
          socket.emit('join game');
          games.get(id).add(userData, socket, data);
        } else {
          socket.emit('notif error', 'Invalid password');
        }
      }

      updateData();
    };

    const startGame = () => {
      if (currGame) {
        currGame.start(() => updateAllUsers());
        updateData();
      }
    };

    const answerProblem = (answer) => {
      if (currGame === null || !currGame.started) {
        console.error(`${userData.username} is trying to pull something funny.`);
      } else {
        // Force typecast to string
        currGame.answer(userData, String(answer));
      }
    };

    socket.on('disconnect', removeUser);
    socket.on('leave game', removeUser);
    socket.on('join game', joinGame);

    socket.on(
      'create game',

      (gameData) => {
        const pw = String(gameData.password);
        let time = +gameData.time;
        let problems = +gameData.problems;

        time = Number((time).toFixed(3));
        problems = Math.floor(problems);
        if (time > 0 && problems > 0 && time < 1000 && problems < 1000) {
          if (gameData.type === 'FTW' || gameData.type === 'CD') {
            // CD defaults
            if (gameData.type === 'CD') {
              problems = 100;
              time = 45;
            }

            const game = new Game(time, problems, gameData.type, pw);
            games.set(game.id, game);

            joinGame({
              pw,
              id: game.id,
            });
          }
        }
      },
    );

    socket.on('answer', answerProblem);
    socket.on('start game', startGame);

    updateData();
  }

  /**
   * Serializing the entire class is probably less error prone for now. This could
   * pose problems later however.
   */
  updateData() {
    const ret = {};

    this.games.forEach((val, key) => {
      ret[key] = val;
    });

    this.io.emit('game data', ret);
  }
}

module.exports = io => new GameManager(io);
