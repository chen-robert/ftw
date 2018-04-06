/*eslint no-console: "warn"*/
"use strict";
const PORT = process.env.PORT || 5000

const express = require("express");
const app = express();
const http = require("http").Server(app);
const login = require("./auth/login.js");
const io = require("socket.io")(http);

app.use(express.static("public"))

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));


http.listen(PORT, () => console.log("Hello! Listening on port 3000!"));

app.post("/login", function (req, res) {
    if (req.body.username && req.body.password) {
        console.log("Success!");
    }
})





io.on("connection", function (socket) {
    console.log("HI");
});
