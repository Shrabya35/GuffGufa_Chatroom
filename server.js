const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

let waitingQueue = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("createRoom", (data) => {
    const { roomId, name } = data;
    leaveCurrentRoom(socket);
    socket.join(roomId);
    socket.username = name;
    socket.roomId = roomId;
    console.log(`Room ${roomId} created and ${name} joined`);

    socket.to(roomId).emit("userJoined", { name });
    const numUsers = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    io.to(roomId).emit("updateUserCount", numUsers);
  });

  socket.on("joinRoom", (data) => {
    const { roomId, name } = data;
    leaveCurrentRoom(socket);
    socket.join(roomId);
    socket.username = name;
    socket.roomId = roomId;
    console.log(`${name} joined room ${roomId}`);

    socket.to(roomId).emit("userJoined", { name });
    const numUsers = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    io.to(roomId).emit("updateUserCount", numUsers);
  });

  socket.on("sendMessage", (data) => {
    const { roomId, message } = data;
    io.to(roomId).emit("receiveMessage", {
      message,
      senderId: socket.id,
      senderName: socket.username,
    });
  });

  //stranger wala ko logic

  socket.on("searchStranger", () => {
    console.log("User searching for a stranger");
    waitingQueue.push(socket);
    leaveCurrentRoom(socket);
    socket.emit("searching");
    if (waitingQueue.length >= 2) {
      const user1 = waitingQueue.shift();
      const user2 = waitingQueue.shift();
      const roomId = `${user1.id}-${user2.id}`;
      socket.strangerRoomId = roomId;
      user1.join(roomId);
      user2.join(roomId);

      user1.emit("matched", { roomId });
      user2.emit("matched", { roomId });

      console.log(`Users matched in room ${roomId}`);
    }
  });

  socket.on("disconnect", () => {
    const { roomId, username } = socket;
    if (roomId && username) {
      console.log(`${username} disconnected from room ${roomId}`);
      socket.to(roomId).emit("userLeaved", { name: username });
      const numUsers = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      io.to(roomId).emit("updateUserCount", numUsers);
    }
  });
});

function leaveCurrentRoom(socket) {
  const { strangerRoomId, roomId, username } = socket;
  if (roomId) {
    socket.leave(roomId);
    console.log(`${username} left room ${roomId}`);
    socket.to(roomId).emit("userLeaved", { name: username });
    const numUsers = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    io.to(roomId).emit("updateUserCount", numUsers);
  }
  if (strangerRoomId) {
    socket.leave(strangerRoomId);
    console.log(`${username} left room ${strangerRoomId}`);
    socket.to(strangerRoomId).emit("userLeaved", { name: username });
    const numUsers = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    io.to(strangerRoomId).emit("updateUserCount", numUsers);
  }
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
