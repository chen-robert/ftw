/*eslint no-console: "warn"*/
"use strict";

const PORT = process.env.PORT || 3000

const SESS_ID_COOKIE = "sessId";

const crypto = require("crypto");
const cookie = require("cookie");

const express = require("express");
const app = express();
const http = require("http").Server(app);

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const auth = require("./server/auth/login.js");
const io = require("socket.io")(http);

const UserManager = require("./server/game/userManager.js");
const userManager = new UserManager(io);

app.use((req, res, next) => {
    //Don't redirect in development
    if (process.env.PRODUCTION === "true" && req.header("x-forwarded-proto") !== "https") {
        res.redirect("https://" + req.header("host") + req.url);
    } else {
        next();
    }
});
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/resources", express.static("public/resources"));

http.listen(PORT, () => console.log("Listening on port " + PORT));

app.get("/", (req, res) => res.redirect("/index.html"));
app.get("/index.html", function (req, res, next) {
    if (req.cookies[SESS_ID_COOKIE]) {
        next();
    } else {
        res.redirect("/login.html");
    }
}, function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});
app.get("/login.html", (req, res) => res.sendFile(__dirname + "/public/login.html"));

//For emojis. See chatUtils.js
app.get("/emoji/*", function (req, res) {
    res.sendFile(__dirname + "/node_modules/emoji-parser" + req.url);
});

app.post("/login", function (req, res) {
    if (req.body.username !== undefined && req.body.password !== undefined) {
        auth.login(req.body.username, req.body.password, function (err, user) {
            if (err) return res.send("Username + password not found");

            const sessId = crypto.randomBytes(64).toString("hex");
            res.cookie(SESS_ID_COOKIE, sessId, {
                maxAge: 999999,
                httpOnly: true
            });

            userManager.addSession(sessId, user.username, () => res.send({
                redirect: "/index.html"
            }));
        });
    } else {
        //Empty field handling should 've be done client-side
        res.send({
            redirect: "/login.html"
        });
    }
});

app.post("/create-account", function (req, res) {
    if (req.body.username !== undefined && req.body.password !== undefined) {
        auth.register(req.body.username, req.body.password, function (err, user) {
            if (err) return res.send("Username already exists.");

            userManager.createData(user.username, function () {
                res.send({
                    redirect: "/login.html"
                });
            });
        });
    } else {
        //Empty field handling should've be done client-side
        res.send({
            redirect: "/login.html"
        });
    }
});

app.get("/logout", function (req, res) {
    if (req.cookies[SESS_ID_COOKIE]) {
        res.clearCookie(SESS_ID_COOKIE);
        userManager.removeSession(req.cookies[SESS_ID_COOKIE]);
    }
    res.redirect("/login.html")
});

io.on("connection", function (socket) {
    var cookies = cookie.parse(socket.handshake.headers.cookie);
    if (!userManager.addSocket(cookies[SESS_ID_COOKIE], socket)) {
        socket.emit("redirect", "/logout");
    }
});
