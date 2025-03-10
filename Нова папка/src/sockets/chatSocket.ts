// // import { Server, Socket } from "socket.io";
// const { Server } = require("socket.io");

// const chatSocket = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("A user connected");

//     socket.on("send_message", (data: { user: string; message: string }) => {
//       console.log("Message received:", data);
//       io.emit("receive_message", data);
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected");
//     });
//   });
// };

// export default chatSocket;
