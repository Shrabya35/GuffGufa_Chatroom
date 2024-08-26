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

  socket.on("createRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Room ${roomId} created and user joined`);
  });

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);
  });

  socket.on("sendMessage", (data) => {
    const { roomId, message } = data;
    io.to(roomId).emit("receiveMessage", { message, senderId: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
