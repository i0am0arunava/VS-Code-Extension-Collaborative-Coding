// server.js
const { Server } = require("socket.io");
const io = new Server(3000, { cors: { origin: "*" } });

// room -> file -> lastContent (you can hash instead if files are big)
const lastByRoomFile = new Map();

function getRoomState(room) {
  if (!lastByRoomFile.has(room)) lastByRoomFile.set(room, new Map());
  return lastByRoomFile.get(room);
}

io.on("connection", (socket) => {
  socket.on("join-room", (room) => socket.join(room));

  socket.on("file-update", ({ room, file, content, sender }) => {
    const state = getRoomState(room);
    const last = state.get(file);

    if (last === content) {
      // Ignore identical content (prevents oscillations)
      return;
    }
    state.set(file, content);
    socket.to(room).emit("file-update", { file, content, sender });
  });


   socket.on("file-open", ({ room, file, sender }) => {
    console.log("file-open");
    socket.to(room).emit("file-open", { file, sender });
  });
});
