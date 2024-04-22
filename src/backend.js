const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const users = {};

const validUsers = ["Panuq", "Yina", "Yama", "Zaira", "Kanti", "GM"]

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
    if (validUsers.includes(user)) {
      username = user;
      users[username] = bending;
      io.emit("users", users);
      console.log(Object.entries(users));
      socket.emit("logged in");
    } else {
      socket.emit("invalid");
    }
  });
  socket.on("roll", () => {
    const first = Math.floor(Math.random() * 6)+1;
    const second = Math.floor(Math.random() * 6)+1;
    io.emit("rolled", { user: username, sum: first+second, result: `2d6@${first},${second}`, bending: users[username] });
  });
  socket.on("logout", (username) => {
    delete users[username];
    io.emit("users", users);
    io.emit("logout", username);
  })
});

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
