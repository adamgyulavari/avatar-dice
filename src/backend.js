const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const users = {};

io.on("connection", (socket) => {
  let username = null;
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete users[username];
    username = null;
    io.emit("users", users);
  });
  socket.on("login", ({ user, bending }) => {
    username = user;
    users[username] = bending;
    io.emit("users", users);
  });
  socket.on("roll", () => {
    const first = Math.floor(Math.random() * 6);
    const second = Math.floor(Math.random() * 6);
    io.emit("rolled", { user: username, result: `2d6@${first},${second}` });
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
