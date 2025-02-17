import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

const chatSocket = (server: HttpServer): void => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Дозволити підключення з будь-якого джерела
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket: Socket) => {
        console.log("A user connected");

        socket.on("send_message", (data: { user: string; message: string }) => {
            console.log("Message received:", data);
            io.emit("receive_message", data);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
};

export default chatSocket;
