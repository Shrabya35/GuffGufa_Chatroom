const socket = io();

const nameInput = document.getElementById("nameInput");
const roomIdInput = document.getElementById("roomIdInput");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const searchStrangerBtn = document.getElementById("searchStrangerBtn");

let currentRoomId;
let searchStrangerBtnToggle = true;

joinRoomBtn.addEventListener("click", () => {
  const roomId = roomIdInput.value;
  const name = nameInput.value;

  if (roomId && name) {
    currentRoomId = roomId;
    socket.emit("joinRoom", { roomId, name });
    chat.innerHTML = " ";
    chat.innerHTML += `<p><strong>Joined room ${roomId} as ${name}</strong></p>`;
  }
});

searchStrangerBtn.addEventListener("click", () => {
  if (searchStrangerBtnToggle) {
    socket.emit("searchStranger");
    searchStrangerBtnToggle = false;
    searchStrangerBtn.textContent = "Searching...";
    chat.innerHTML = "";
  }
});

socket.on("matched", (data) => {
  const { roomId } = data;
  currentRoomId = roomId;
  searchStrangerBtnToggle = true;
  chat.innerHTML = "<p><strong>Matched with a stranger!</strong></p>";
  searchStrangerBtn.textContent = "Search Stranger";
});

socket.on("searching", () => {
  chat.innerHTML +=
    "<p><em>Searching for a stranger to chat with.....</em></p>";
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
  chat.innerHTML += `<p><em>${
    name ? name : "stranger"
  } has left the room</em></p>`;
});
socket.on("updateUserCount", (number) => {
  chat.innerHTML += `<p><em> (${number} members)</em></p>`;
});

socket.on("receiveMessage", (data) => {
  const { message, senderId, senderName } = data;
  if (senderId !== socket.id) {
    chat.innerHTML += `<p><strong class="chatbox-other">${
      senderName ? senderName : "stranger"
    }:</strong> ${message}</p>`;
  }
});
