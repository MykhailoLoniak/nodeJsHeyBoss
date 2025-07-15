require('dotenv').config()
const http = require("http");
const cors = require("cors");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const jobsRoutes = require("./routes/jobsRoutes")
const authRoutes = require("./routes/authRoutes");
const chatRouters = require("./routes/chatRoutes");
const avatarRoutes = require("./routes/avatarRoutes")
const reviewsRoutes = require("./routes/reviewsRoutes")
const taskRoutes = require("./routes/taskRoutes")
const teamRoutes = require("./routes/teamRoutes")
const eventsRouter = require("./routes/eventsRouter")

const { authMiddleware } = require("./middlewares/authMiddleware");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const profileCompanyRoutes = require("./routes/profileCompanyRoutes");
const { setupWebSocketServer } = require("./websocket/websocketServer");
const profileJobSeekerRoutes = require("./routes/profileJobSeekerRoutes");

const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);
const PORT = process.env.PORT || 3005;


// const corsOptions = {
//   origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

const PROD_ORIGIN = process.env.CLIENT_ORIGIN;           // наприклад "https://myapp.com"
const DEV_ORIGIN = "http://localhost:3000";

const allowedOrigins = [];
// якщо в продакшені вказано CLIENT_ORIGIN, додаємо його
if (PROD_ORIGIN) {
  allowedOrigins.push(PROD_ORIGIN);
}
// якщо ми не в проді (NODE_ENV !== 'production'), додаємо локалхост
// if (process.env.NODE_ENV !== 'production') {
//   allowedOrigins.push(DEV_ORIGIN);
// }

//______________________
allowedOrigins.push(DEV_ORIGIN); // дозволяємо localhost завжди

if (PROD_ORIGIN) {
  allowedOrigins.push(PROD_ORIGIN);
}
//______________________
const corsOptions = {
  origin: (origin, callback) => {
    // запити без origin (Postman, curl) теж пропускаємо
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: доступ з ${origin} заборонено`), false);
    }
  },
  credentials: true,               // потрібні кукі або auth-заголовки
  allowedHeaders: ["Content-Type", "Authorization"],
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

app.use("/api/auth", authRoutes);
app.use("/api/auth/profile-job-seeker", profileJobSeekerRoutes);
app.use("/api/auth/profile-company", profileCompanyRoutes);
app.use("/api/auth/jobs", jobsRoutes);
app.use("/api/auth/reviews", reviewsRoutes);
app.use('/api/auth/events', eventsRouter);
app.use("/api/auth/task", taskRoutes);
app.use("/api/auth/team", teamRoutes);

app.use("/api/auth/avatar", avatarRoutes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/chats", chatRouters);

app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
