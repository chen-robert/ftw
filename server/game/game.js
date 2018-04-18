const uuidv1 = require('uuid/v1');
const problemUtils = require('./problemUtils.js');
const elo = require('./elo.js');

const chatUtils = require('./chat/chatUtils.js');

module.exports = class Game {
  constructor(timePerProblem, problems, type, pw) {
    // Active users in game
    this.users = [];
    this.usersThatLeft = [];
    // This won't be transfered because map's can't be serialized.
    this.dataToSocket = new Map();
    this.dataToMongoose = new Map();

    this.id = uuidv1();
    this.host = null;

    this.started = false;
    this.timePerProblem = +timePerProblem;
    this.problems = +problems;
    this.type = type;

    this.currProblem = {};
    this.answerValue = NaN;

    this.pw = pw;
    this.private = pw !== '';
  }

  // We need access to mongooseObj to update user ratings later.
  add(data, socket, mongooseObj) {
    if (this.users.indexOf(data) === -1) {
      this.users.push(data);
      this.dataToSocket.set(data, socket);

      // Only use mongoose if register user
      if (!data.username.startsWith('Guest ')) {
        this.dataToMongoose.set(data, mongooseObj);
      }
    }

    /* eslint no-param-reassign: 0 */
    data.score = 0;
    data.answer = undefined;
    /* eslint no-param-reassign: 2 */

    this.sendScores();

    if (this.host === null) {
      this.setHost(data);
    }
  }

  setHost(data) {
    this.host = data;
    this.dataToSocket.get(data).emit('set host');
  }

  remove(data) {
    if (this.users.indexOf(data) === -1) {
      console.error('Tried to delete somebody that didn\'t exist in game.');
      return true;
    }

    this.dataToSocket.delete(data);
    this.users.splice(this.users.indexOf(data), 1);

    this.usersThatLeft.push(data);

    this.sendScores();

    // If the room would be empty, we'll delete it
    if (this.users.length === 0) {
      return true;
    }

    if (this.host === data) {
      this.setHost(this.users[0]);
    }

    return false;
  }

  start(callback) {
    if (this.started) return;
    let problemWorth = this.users.length;
    if (this.type === 'CD') problemWorth = 1;

    this.started = true;

    this.users.forEach((user) => {
      user.canAnswer = false;
      user.score = 0;
    });

    this.dataToSocket.forEach(socket => socket.emit(
      'timer',

      {
        type: 'Starting',
        time: 5,
      },
    ));

    // let time = 5;

    this.functionArr = [];
    this.arrIndex = -1;
    setTimeout(() => this.safeProgress(0), 5 * 1000);

    for (let i = 0; i < this.problems; i += 1) {
      this.functionArr.push(() => {
        this.answerValue = problemWorth;

        this.users.forEach((user) => { user.canAnswer = true; });

        // Reset CD scoreboard
        this.users.forEach((user) => { user.answer = undefined; });
        this.sendScores();

        const problem = problemUtils.getProblem();
        this.currProblem = problem;

        // Order of these emits matters.
        this.dataToSocket.forEach(socket => socket.emit('timer', {
          type: `Problem #${i + 1}`,
          time: this.timePerProblem,
        }));

        this.dataToSocket.forEach(socket => socket.emit('problem', {
          text: problem.text,
          answer: '0x536865727279',
        }));

        setTimeout(() => this.safeProgress((2 * i) + 1), this.timePerProblem * 1000);
      });

      if (i !== this.problems - 1) {
        this.functionArr.push(() => {
          this.users.forEach((user) => { user.canAnswer = false; });

          // Reason why these are reversed from above is because game hides / shows the answer
          // box based on order of these emits.
          this.dataToSocket.forEach(socket => socket.emit('problem', {
            text: 'Loading Next Problem...',
            answer: '0x536865727279',
          }));

          this.dataToSocket.forEach(socket => socket.emit('timer', {
            type: 'Intermission',
            time: 5,
          }));

          this.sendScores();

          setTimeout(() => this.safeProgress((2 * i) + 2), 5 * 1000);
        });
      }
    }

    this.functionArr.push(() => {
      this.users.forEach((user) => { user.canAnswer = false; });

      this.dataToSocket.forEach(socket => socket.emit('problem', {
        text: 'It\'s over! Finally!',
        answer: '0x536865727279',
      }));

      this.dataToSocket.forEach(socket => socket.emit('timer', {
        type: 'Round Over',
        time: 1,
      }));

      this.sendScores();
      this.updateElo();

      callback();
    });
  }

  updateElo() {
    const allUsers = this.users.concat(this.usersThatLeft);
    const newRatings = [];

    for (let i = 0; i < allUsers.length; i += 1) {
      let ratingChange = 0;

      for (let z = 0; z < allUsers.length; z += 1) {
        if (i !== z) {
          ratingChange += elo.ratingChange(
            allUsers[i].rating,
            allUsers[z].rating,
            allUsers[i].score,
            allUsers[z].score,
          );
        }
      }

      newRatings.push(allUsers[i].rating + ratingChange);
    }

    allUsers.forEach((data, i) => {
      // Don't update ratings for guests
      if (!data.username.startsWith('Guest ')) {
        data.rating = newRatings[i];
        this.dataToMongoose.get(data).rating = newRatings[i];

        this.dataToMongoose.get(data).save((err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    });
  }

  // Safely progress to the next part of the game.
  safeProgress(expected) {
    if (this.arrIndex + 1 !== expected) {
      return;
    }

    this.arrIndex += 1;
    const nextFunc = this.functionArr[this.arrIndex];

    if (typeof nextFunc === 'function') {
      nextFunc();
    }
  }

  // Send scores to everybody
  sendScores() {
    // Lazy implementation, but we can afford sending extra data
    this.dataToSocket.forEach(socket => socket.emit('scores', this.users));
  }

  answer(user, answer) {
    const cleanAnswer = chatUtils.clean(answer);

    if (user.canAnswer) {
      user.canAnswer = false;

      let shouldProgress = false;

      if (answer.toLowerCase() === this.currProblem.answer.toLowerCase()) {
        user.score += this.answerValue;
        this.answerValue -= 1;

        if (this.type === 'CD') {
          shouldProgress = true;
          user.answer = {
            text: cleanAnswer,
            correct: true,
          };
        }
      } else if (this.type === 'CD') {
        // If we're in CD, pass on incorrect answers
        user.answer = {
          text: cleanAnswer,
          correct: false,
        };
      }

      if (this.users.filter(usrdata => usrdata.canAnswer).length === 0) {
        shouldProgress = true;
      }

      if (shouldProgress) {
        this.safeProgress(this.arrIndex + 1);
        if (this.type === 'CD' && user.score === 4) {
          // Skip to the end
          this.arrIndex = NaN;
          this.functionArr[this.functionArr.length - 1]();
        }
      }
      if (this.type === 'CD') {
        // Update incorrect answers for CD
        this.sendScores();
      }
    }
  }
};
