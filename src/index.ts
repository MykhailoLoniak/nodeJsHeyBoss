import express, { Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import chatSocket from "./controllers/chatController";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(cors());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chat", chatRoutes);

chatSocket(server);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express!");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
