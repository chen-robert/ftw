/* eslint no-param-reassign: 0 */
const uuidv1 = require('uuid/v1');
const problemUtils = require('./problemUtils.js');
const elo = require('./elo.js');
const katex = require('../../public/resources/vendor/katex/katex.min.js');

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
    this.timePerProblem = Number(timePerProblem);
    this.problems = Number(problems);
    this.type = type;

    this.currProblem = {};
    this.answerValue = NaN;

    this.pw = pw;
    this.private = pw !== '';

    // For review purposes
    this.problemArr = [];
  }

  // We need access to mongooseObj to update user ratings later.
  add(data, socket, mongooseObj) {
    if (this.users.indexOf(data) === -1) {
      this.users.push(data);
      this.dataToSocket.set(data, socket);
      this.dataToMongoose.set(data, mongooseObj);
    }

    data.score = 0;
    data.answer = undefined;

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

    if (this.dataToSocket.get(data)) {
      // this.dataToSocket.get(data).emit('chat freeze', false);
      this.dataToSocket.get(data).leave('frozen');
      this.sendQueue(data);
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

  start() {
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

    // leet time = 5;

    this.functionArr = [];
    this.arrIndex = -1;

    setTimeout(() => this.safeProgress(0), 5 * 1000);

    for (let i = 0; i < this.problems; i += 1) {
      this.functionArr.push(() => {
        this.answerValue = problemWorth;

        this.users.forEach((user) => {
          user.canAnswer = true;
        });

        // Reset CD scoreboard
        this.users.forEach((user) => {
          user.answer = undefined;
        });

        this.sendScores();

        const problem = problemUtils.getProblem();

        // Replace $...$ with KaTeX
        problem.text = problem.text.replace(
          /\$(.*?)\$/g,

          (a, b) => {
            try {
              return katex.renderToString(b);
            } catch (e) {
              return a;
            }
          },
        );

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

        this.problemArr.push(problem);

        this.dataToSocket.forEach(socket => socket.join('frozen'));

        setTimeout(() => this.safeProgress((2 * i) + 1), this.timePerProblem * 1000);
      });

      if (i !== this.problems - 1) {
        this.functionArr.push(() => {
          this.users.forEach((user) => {
            user.canAnswer = false;
          });

          /**
           * Reason why these are reversed from above is because game hides / shows the answer
           * box based on order of these emits.
           */
          this.dataToSocket.forEach(socket => socket.emit('problem', {
            text: 'Loading Next Problem...',
            answer: '0x536865727279',
          }));

          this.dataToSocket.forEach(socket => socket.emit('timer', {
            type: 'Intermission',
            time: 5,
          }));


          this.dataToSocket.forEach((socket, data) => {
            socket.leave('frozen');
            this.sendQueue(data);
          });

          this.sendScores();

          setTimeout(() => this.safeProgress((2 * i) + 2), 5 * 1000);
        });
      }
    }

    this.functionArr.push(() => {
      this.users.forEach((user) => {
        user.canAnswer = false;
      });

      this.dataToSocket.forEach(socket => socket.emit('problem', {
        text: 'It\'s over! Finally!',
        answer: '0x536865727279',
      }));

      this.dataToSocket.forEach(socket => socket.emit('timer', {
        type: 'Round Over',
        time: 1,
      }));

      this.dataToSocket.forEach((socket, data) => {
        socket.leave('frozen');
        this.sendQueue(data);
      });

      this.sendReviewProblems();
      this.sendScores();
      this.updateElo();
    });
  }

  sendReviewProblems() {
    this.dataToSocket.forEach(socket => socket.emit('review game', this.problemArr));
  }

  updateElo() {
    const allUsers = this.users.concat(this.usersThatLeft);
    const newRatings = [];

    let maxChange = -1;
    let maxChangeData = null;
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

      if (ratingChange > maxChange) {
        maxChange = ratingChange;
        maxChangeData = allUsers[i];
      } else if (ratingChange === maxChange) {
        maxChangeData = null;
      }

      newRatings.push(allUsers[i].rating + ratingChange);
    }

    allUsers.forEach((data, i) => {
      data.rating = newRatings[i];
      const mongooseObj = this.dataToMongoose.get(data);
      mongooseObj.rating = newRatings[i];

      // Failsafe
      if (!mongooseObj.games) {
        mongooseObj.games = 0;
      }

      if (!mongooseObj.wins) {
        mongooseObj.wins = 0;
      }

      mongooseObj.games += 1;

      if (maxChangeData === data) {
        mongooseObj.wins += 1;
      }

      // Failsafe
      if (Number.isNaN(mongooseObj.games)) {
        mongooseObj.games = 1;
      }

      if (Number.isNaN(mongooseObj.wins)) {
        mongooseObj.wins = +(maxChangeData === data);
      }

      mongooseObj.save((err) => {
        if (err) {
          console.error(err);
        }
      });
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

  get serializedForm() {
    return {
      host: this.host,
      started: this.started,
      type: this.type,
      timePerProblem: this.timePerProblem,
      users: this.users,
      problems: this.problems,
      private: this.private
    };
  }
};
