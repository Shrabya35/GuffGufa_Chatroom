const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("createRoom", (data) => {
    const { roomId, name } = data;
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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
