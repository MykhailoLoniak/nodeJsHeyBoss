require('dotenv').config()
const express = require("express");
const session = require("express-session");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const chatRouters = require("./routes/chatRoutes");
const { authMiddleware } = require("./middlewares/authMiddleware");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const { setupWebSocketServer } = require("./websocket/websocketServer");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3005;

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  // methods: "GET,POST,PUT,DELETE",
  // allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(session({
  secret: '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',  // заміни на безпечний секрет
  resave: false,
  saveUninitialized: true,
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(cookieParser());

setupWebSocketServer(server);

app.use("/api/auth", authRoutes);
// app.use("/api/profile", profle)
app.use("/chats", authMiddleware, chatRouters);

app.get("/api/contractor", authMiddleware, (req, res) => {
  res.json({ message: "Welcome, Contractor!" });
});

app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
