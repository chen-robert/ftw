/*eslint no-console: "warn"*/
"use strict";

const PORT = process.env.PORT || 5000

const crypto = require("crypto");

const express = require("express");
const app = express();
const http = require("http").Server(app);

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const auth = require("./server/auth/login.js");
const io = require("socket.io")(http);

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/resources", express.static("public/resources"));

http.listen(PORT, () => console.log("Hello! Listening on port 3000!"));

app.get("/", (req, res) => res.redirect("/index.html"));
app.get("/index.html", function (req, res, next) {
    if (req.cookies.sessId) {
        next();
    } else {
        res.redirect("/login.html");
    }
}, function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});
app.get("/login.html", (req, res) => res.sendFile(__dirname + "/public/login.html"));

app.post("/login", function (req, res) {
    if (req.body.username && req.body.password) {
        auth.login(req.body.username, req.body.password, function (err, user) {
            if (err) return res.send("TODO: Error page");
            res.cookie("sessId", crypto.randomBytes(64).toString("hex"), {
                maxAge: 999999,
                httpOnly: true
            });
            console.log(user);
            return res.redirect("/index.html");
        });
    }
});

app.post("/create-account", function (req, res) {
    if (req.body.username && req.body.password) {
        auth.register(req.body.username, req.body.password, function (err, user) {
            if (err) return "TODO: Error page";
            return res.sendFile(__dirname + "/public/login.html");
        });
    }
});

app.get("/logout", function (req, res) {
    if (req.cookies.sessId) {
        res.clearCookie("sessId");
    }
    res.redirect("/login.html");
});


io.on("connection", function (socket) {
    console.log("HI");
});
