const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createDeck, drawCard, cardValue } = require("./deck");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// เสิร์ฟไฟล์จากโฟลเดอร์ public
app.use(express.static("public"));

let players = [];
let deck = createDeck();
let gameMode = "high"; // ค่าเริ่มต้น: หาผู้ชนะ (แต้มสูงสุด)

io.on("connection", (socket) => {
  socket.on("join", (name) => {
    players.push({ id: socket.id, name, card: null, rank: null });
    io.emit("players", players);
  });

  socket.on("setMode", (mode) => {
    if (mode === "high" || mode === "low") {
      gameMode = mode;
      io.emit("modeChanged", gameMode);
    }
  });

  socket.on("draw", () => {
    io.to(socket.id).emit("countdown");

    setTimeout(() => {
      players = players.map(p => {
        if (p.id === socket.id && !p.card) {
          const card = drawCard(deck);
          return { ...p, card };
        }
        return p;
      });

      const ranked = [...players].sort((a, b) => {
        return gameMode === "high"
          ? cardValue(b.card) - cardValue(a.card) // โหมดหาผู้ชนะ
          : cardValue(a.card) - cardValue(b.card); // โหมดหาผู้แพ้
      });
      ranked.forEach((p, index) => p.rank = index + 1);

      io.emit("players", ranked);
      if (ranked.length > 0) {
        io.emit("winner", ranked[0]);
      }
    }, 5000);
  });

  socket.on("reset", () => {
    players = [];
    deck = createDeck();
    io.emit("players", players);
    io.emit("winner", null);
  });

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    io.emit("players", players);
  });
});

// ✅ ใช้ process.env.PORT เพื่อรองรับระบบ cloud
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
