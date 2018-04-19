/* eslint no-console: 'warn' */
const PORT = process.env.PORT || 3000;

const SESS_ID_COOKIE = 'sessId';

const crypto = require('crypto');
const cookie = require('cookie');

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

const express = require('express');

const app = express();
const http = require('http').Server(app);

const fs = require('fs');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const auth = require('./server/auth/login.js');
const io = require('socket.io')(http);

const UserManager = require('./server/game/userManager.js');

const userManager = new UserManager(io);
const reportManager = require('./server/reportManager.js');

const chatLog = require('./server/game/chat/chatLog.js');

const swearList = require('swearjar');

app.use((req, res, next) => {
  // Don't redirect in development
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host') + req.url}`);
  } else {
    next();
  }
});

app.use(bodyParser.urlencoded({
  extended: false,
}));

app.use(bodyParser.json());
app.use(cookieParser());

http.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.use('/resources', express.static('public/resources'));
app.set('view engine', 'ejs');


// Standard EJS stuff. Sending the user object so that the navbar can get the username.
app.get(
  '/',

  (req, res) => {
    if (userManager.users.has(req.cookies[SESS_ID_COOKIE])) {
      res.render('pages/index', { user: userManager.users.get(req.cookies[SESS_ID_COOKIE]) });
    } else {
      res.redirect('/login');
    }
  },
);

app.get('/report', (req, res) => res.render('pages/report', { user: userManager.users.get(req.cookies[SESS_ID_COOKIE]) }));

app.get(
  '/login',

  (req, res) => {
    if (userManager.users.has(req.cookies[SESS_ID_COOKIE])) {
      res.redirect('/');
    } else {
      res.render('pages/login');
    }
  },
);

// For emojis. See chatUtils.js
app.get('/emoji/*', (req, res) => res.sendFile(`${__dirname}/node_modules/emoji-parser${req.url}`));

app.get(
  '/changelog',

  (req, res) => {
    fs.readFile(
      `${__dirname}/public/changelog.txt`,

      (err, changelog) => res.render('pages/changelog', {
        user: userManager.users.get(req.cookies[SESS_ID_COOKIE]),
        changelog,
      }),
    );
  },
);

app.post(
  '/login',

  (req, res) => {
    if (req.body.username !== undefined && req.body.password !== undefined) {
      auth.login(
        req.body.username,
        req.body.password,

        (err, user) => {
          if (err) {
            res.send('Username + password not found');
            return;
          }

          let ip = req.headers['x-forwarded-for'];

          if (ip) {
            ip = ip.split(',').pop();
          } else {
            ip = req.connection.remoteAddress;
          }

          console.log(`${req.body.username} joined`);

          const sessId = crypto.randomBytes(64).toString('hex');
          res.cookie(SESS_ID_COOKIE, sessId, {
            maxAge: 999999,
            httpOnly: true,
          });

          userManager.addSession(
            sessId,
            user.username,
            ip,

            () => res.send({
              redirect: '/',
            }),
          );
        },
      );
    } else {
      // Empty field handling should've be done client-side
      res.send({
        redirect: '/login',
      });
    }
  },
);

app.post(
  '/create-account',

  (req, res) => {
    if (typeof req.body.username === 'string' && typeof req.body.password === 'string') {
      if (req.body.username.length < 3 || req.body.username.length > 16) {
        res.send('Please make sure username lengths are between 3 and 16 characters!');
        return;
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(req.body.username)) {
        res.send('Please make sure the username only includes numbers, letters, dashes, and/or underscores.');
        return;
      }

      if (swearList.profane(req.body.username)) {
        res.send('Username contains inappropriate language.');
        return;
      }

      auth.register(
        req.body.username,
        req.body.password,

        (err, user) => {
          if (err) {
            res.send('Username already exists.');
            return;
          }

          userManager.createData(
            user.username,

            () => {
              res.send({
                redirect: '/login',
              });
            },
          );
        },
      );
    } else {
      // Empty field handling should've be done client-side
      res.send({
        redirect: '/login',
      });
    }
  },
);

app.post(
  '/report',

  (req, res) => {
    if (
      req.body.username !== undefined
      && req.body.comment !== undefined
      && typeof req.body.username === 'string'
      && typeof req.body.comment === 'string'
    ) {
      let ip = req.headers['x-forwarded-for'];

      if (ip) {
        ip = ip.split(',').pop();
      } else {
        ip = req.connection.remoteAddress;
      }

      reportManager.addReport(
        req.body.username,
        req.body.comment,
        ip,

        (err) => {
          if (err) {
            return res.send({
              success: true,
              text: 'Something went wrong when processing your report',
            });
          }

          return res.send({
            success: true,
            text: 'Thank you for your report',
          });
        },
      );
    }
  },
);

app.get(
  '/logout',

  (req, res) => {
    if (req.cookies[SESS_ID_COOKIE]) {
      res.clearCookie(SESS_ID_COOKIE);
      userManager.removeSession(req.cookies[SESS_ID_COOKIE]);
    }

    res.redirect('/login');
  },
);

app.get(
  '/log/:date',

  (req, res) => {
    const { date } = req.params;

    if (!/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(date)) {
      res.type('text/plain');
      res.status('404').send(`Cannot GET ${req.url}`);
    } else {
      fs.readFile(
        `${__dirname}/admins.txt`,

        (err, list) => {
          const admins = String(list).split('\n');
          const userdata = userManager.users.get(req.cookies[SESS_ID_COOKIE]);

          // Must be logged in as admin to access logs
          if (admins.indexOf(userdata ? userdata.username : '') === -1) {
            res.type('text/plain');
            res.status('403').send('Forbidden');
          } else {
            res.render('pages/chatlog');
          }
        },
      );
    }
  },
);

app.post(
  '/log/:date',

  (req, res) => {
    res.type('text/plain');
    const { date } = req.params;

    if (!/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(date)) {
      res.status('404').send(`Cannot POST ${req.url}`);
    } else {
      fs.readFile(
        `${__dirname}/admins.txt`,

        (err, list) => {
          const admins = String(list).split('\n');
          const userdata = userManager.users.get(req.cookies[SESS_ID_COOKIE]);

          // Need to be admin AND have password
          if (admins.indexOf(userdata ? userdata.username : '') !== -1 && req.body.password === process.env.ADMIN_PASSWORD) {
            chatLog.find({ date }).exec((error, msgs) => {
              res.send(msgs.map(msg => `[${msg.time}] ${msg.username}: ${msg.message}`).join('\n'));
            });
          } else {
            res.status('403').send('Forbidden');

            if (
              userdata
              && admins.indexOf(userdata ? userdata.username : '') === -1
              && req.body.password
              && req.body.password !== process.env.ADMIN_PASSWORD
            ) {
              // Somebody tried to get in with a false password. How naughty!
              console.error(`${userdata.username} tried getting chat logs with key ${req.body.password}`);
            } else if (
              userdata
              && admins.indexOf(userdata ? userdata.username : '') === -1
              && req.body.password === process.env.ADMIN_PASSWORD
            ) {
              // Uh oh
              console.error(`${userdata.username} knows the admin key and it has likely been compromised.`);
            }
          }
        },
      );
    }
  },
);

app.get(
  '/stats/:username',

  (req, res) => {
    res.type('json');

    userManager.getData(
      req.params.username,

      (err, data) => {
        if (err) {
          return res.send({
            error: 'Username not found',
          });
        }

        return res.send(data);
      },
    );
  },
);

io.on(
  'connection',

  (socket) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie);

    userManager.addSocket(cookies[SESS_ID_COOKIE], socket);
  },
);
