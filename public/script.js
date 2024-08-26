const socket = io();

const roomIdInput = document.getElementById("roomIdInput");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

let currentRoomId;

joinRoomBtn.addEventListener("click", () => {
  const roomId = roomIdInput.value;
  if (roomId) {
    currentRoomId = roomId;
    socket.emit("joinRoom", roomId);
    chat.innerHTML += `<p><strong>Joined room ${roomId}</strong></p>`;
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

socket.on("receiveMessage", (data) => {
  const { message, senderId } = data;
  if (senderId !== socket.id) {
    chat.innerHTML += `<p><strong class="chatbox-other">Other:</strong> ${message}</p>`;
  }
});
