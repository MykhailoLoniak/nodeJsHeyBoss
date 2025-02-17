import { Server } from "socket.io";

const chatSocket = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Налаштуйте під свій фронтенд
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket: any) => {
        console.log("A user connected");

        socket.on("send_message", (data: any) => {
            console.log("Message received:", data);
            io.emit("receive_message", data);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
};

export default chatSocket;
