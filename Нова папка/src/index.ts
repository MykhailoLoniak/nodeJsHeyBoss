const express = require("express");
const http = require("http");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRouter");
const cookieParser = require("cookie-parser");
const chatRouters = require("./routes/chatRoutes");
const {
  errorMidleware: errorMidlewares,
} = require("./middlewares/errorMidleware");
const {
  authMiddleware: authMiddlewares,
} = require("./middlewares/authMiddleware");
const ws = require("ws");

/** @typedef {import("express").Request} Request */
/** @typedef {import("express").Response} Response */
/** @typedef {import("express").NextFunction} NextFunction */

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3005;

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(errorMidlewares);
// app.use(authMiddlewares);

const wss = new ws.Server({ server });

wss.on("connection", (ws) => {
  console.log("Нове WebSocket підключення");

  // Обробка повідомлень
  ws.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    console.log("Отримано повідомлення:", parsedMessage);

    if (parsedMessage.action === "sendMessage") {
      // Тут можна передавати повідомлення всім клієнтам в чаті
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              action: "message",
              message: {
                userName: parsedMessage.userName,
                text: parsedMessage.text,
              },
            })
          );
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("WebSocket підключення закрито");
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

app.use("/api/auth", authRoutes);
app.use("/api/client", authMiddlewares, clientRoutes);
app.use("/chats", authMiddlewares, chatRouters);

// app.use("/chats", chatRouters);
app.get("/contractor", authMiddlewares, (req, res) => {
  res.json({ message: "Welcome, Contractor!" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
