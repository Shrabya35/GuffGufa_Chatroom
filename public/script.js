const socket = io();

const nameInput = document.getElementById("nameInput");
const roomIdInput = document.getElementById("roomIdInput");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

let currentRoomId;

joinRoomBtn.addEventListener("click", () => {
  const roomId = roomIdInput.value;
  const name = nameInput.value;

  if (roomId && name) {
    currentRoomId = roomId;
    socket.emit("joinRoom", { roomId, name });
    chat.innerHTML += `<p><strong>Joined room ${roomId} as ${name}</strong></p>`;
  }
});

sendMessageBtn.addEventListener("click", () => {
  const message = messageInput.value;
  if (message && currentRoomId) {
    socket.emit("sendMessage", { roomId: currentRoomId, message });

    chat.innerHTML += `<p><strong class="chatbox-you">You:</strong> ${message}</p>`;
    messageInput.value = "";
  }
});

socket.on("userJoined", (data) => {
  const { name } = data;
  chat.innerHTML += `<p><em>${name} has joined the room</em></p>`;
});
socket.on("userLeaved", (data) => {
  const { name } = data;
  chat.innerHTML += `<p><em>${name} has left the room</em></p>`;
});
socket.on("updateUserCount", (number) => {
  chat.innerHTML += `<p><em> (${number} members)</em></p>`;
});

socket.on("receiveMessage", (data) => {
  const { message, senderId, senderName } = data;
  if (senderId !== socket.id) {
    chat.innerHTML += `<p><strong class="chatbox-other">${senderName}:</strong> ${message}</p>`;
  }
});
