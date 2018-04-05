/*eslint no-console: "warn"*/
"use strict";
const PORT = 5000

const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static("public"))

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

http.listen(PORT, () => console.log("Hello! Listening on port 3000!"));

io.on("connection", function (socket) {
    console.log("HI");
});
