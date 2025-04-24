require('dotenv').config()
const express = require("express");
const session = require("express-session");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const profileJobSeekerRoutes = require("./routes/profileJobSeekerRoutes");
const chatRouters = require("./routes/chatRoutes");
const { authMiddleware } = require("./middlewares/authMiddleware");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const { setupWebSocketServer } = require("./websocket/websocketServer");
const profileCompanyRoutes = require("./routes/profileCompanyRoutes");
const path = require("path");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3005;


const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
};

app.use(session({
  secret: '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',  // заміни на безпечний секрет
  resave: false,
  saveUninitialized: true,
}));

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

setupWebSocketServer(server);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/auth/profile-job-seeker", profileJobSeekerRoutes);
app.use("/api/auth/profile-company", profileCompanyRoutes);
app.use("/chats", authMiddleware, chatRouters);

app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
