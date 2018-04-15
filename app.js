/*eslint no-console: "warn"*/
"use strict";

const PORT = process.env.PORT || 3000

const SESS_ID_COOKIE = "sessId";

const crypto = require("crypto");
const cookie = require("cookie");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

const express = require("express");
const app = express();
const http = require("http").Server(app);

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const auth = require("./server/auth/login.js");
const io = require("socket.io")(http);

const UserManager = require("./server/game/userManager.js");
const userManager = new UserManager(io);
const reportManager = require("./server/reportManager.js");

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
app.get("/report.html", (req, res) => res.sendFile(__dirname + "/public/report.html"));
app.get("/login.html", (req, res) => res.sendFile(__dirname + "/public/login.html"));

//For emojis. See chatUtils.js
app.get("/emoji/*", function (req, res) {
    res.sendFile(__dirname + "/node_modules/emoji-parser" + req.url);
});

app.get("/changelog.txt", (req, res) => res.sendFile(__dirname + "/public/changelog.txt"));

app.post("/login", function (req, res) {
    if (req.body.username !== undefined && req.body.password !== undefined) {
        auth.login(req.body.username, req.body.password, function (err, user) {
            if (err) return res.send("Username + password not found");

            var ip = req.headers["x-forwarded-for"];
            if (ip) {
                ip = ip.split(",").pop();
            } else {
                ip = req.connection.remoteAddress
            }
            console.log(req.body.username + " logging on from " + ip);

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
    if (typeof req.body.username === "string" && typeof req.body.password == "string") {
        if (req.body.username.length < 3 || req.body.username.length > 16) {
            return res.send("Please make sure username lengths are between 3 and 16 characters!")
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(req.body.username)) {
            return res.send("Please make sure the username only includes numbers, letters, dashes, and/or underscores.");
        }
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
app.post("/report", function (req, res) {
    if (req.body.username !== undefined && req.body.comment !== undefined && typeof req.body.username === "string" && typeof req.body.comment == "string") {
        var ip = req.headers["x-forwarded-for"];
        if (ip) {
            ip = ip.split(",").pop();
        } else {
            ip = req.connection.remoteAddress
        }
        reportManager.addReport(req.body.username, req.body.comment, ip, (err) => {
            if (err) {
                return res.send({
                    success: true,
                    text: "Something went wrong when processing your report"
                });
            }
            return res.send({
                success: true,
                text: "Thank you for your report"
            });
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
