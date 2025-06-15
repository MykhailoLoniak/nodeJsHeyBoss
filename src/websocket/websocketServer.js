const ws = require("ws");
const { jwtService } = require("../services/jwtService");
const { Message } = require("../models/message");
const { UserChatRoom } = require("../models/userChatRoom");

const users = new Map();

const setupWebSocketServer = (server) => {
  const wss = new ws.Server({ server });

  wss.on("connection", (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const token = urlParams.get('token');



    if (!token) {
      ws.send(JSON.stringify({ action: "error", message: "Unauthorized" }));
      ws.close();
      return;
    }

    try {
      console.log('-----------------------------', token);
      const decoded = jwtService.verify(token);
      console.log('-----------------------------', decoded);

      if (!decoded || !decoded.id) {
        throw new Error("Invalid token payload");
      }

      ws.userId = decoded.id;
      ws.firstName = decoded.firstName;
      ws.lastName = decoded.lastName;
      users.set(ws.userId, ws);
      console.log(`Користувач ${ws.userId} підключився`);
    } catch (error) {
      console.error("[WS AUTH ERROR]:", error.message);
      ws.send(JSON.stringify({ action: "error", message: "Unauthorized" }));
      ws.close();
      return;
    }

    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message);

        if (!parsedMessage.action) {
          throw new Error("Invalid message format");
        }

        switch (parsedMessage.action) {
          case "sendMessage":
            const { chatRoomId, text } = parsedMessage;

            if (!chatRoomId || !ws.userId || !text) {
              throw new Error("Missing chat message parameters");
            }

            // Зберігаємо повідомлення в таблицю messages
            const newMessage = await Message.create({
              chat_room_id: chatRoomId,
              sender_id: ws.userId,
              text,
            });

            ws.chatRoomId = chatRoomId;

            // Розсилаємо повідомлення усім користувачам цієї кімнати
            wss.clients.forEach((client) => {
              if (
                client.readyState === ws.OPEN &&
                client.chatRoomId === ws.chatRoomId
              ) {
                client.send(
                  JSON.stringify({
                    action: "message",
                    chatRoomId: ws.chatRoomId,
                    message: {
                      id: newMessage.id,
                      sender_id: ws.userId,
                      text,
                      createdAt: newMessage.createdAt,
                      firstName: ws.firstName,
                      lastName: ws.lastName,
                    },
                  })
                );
              }
            });

            break;

          default:
            throw new Error("Unknown action");
        }
      } catch (error) {
        console.error("[WS ERROR]:", error.message);
        ws.send(JSON.stringify({ action: "error", message: error.message }));
      }
    });

    ws.on("close", () => {
      users.forEach((socket, userId) => {
        if (socket === ws) {
          users.delete(userId);
          console.log(`Користувач ${userId} відключився`);
        }
      });
    });

    ws.on("error", (error) => {
      console.error("[WS CLIENT ERROR]:", error);
    });
  });
};

module.exports = { setupWebSocketServer };


// const ws = require("ws");
// const { jwtService } = require("../services/jwtService");
// const { UserChatRoom } = require("../models/userChatRoom");

// const users = new Map(); // Зберігаємо активні WebSocket підключення

// const setupWebSocketServer = (server) => {
//   const wss = new ws.Server({ server });

//   wss.on("connection", (ws, req) => {
//     const urlParams = new URLSearchParams(req.url.split('?')[1]);
//     const token = urlParams.get('token');


//     if (!token) {
//       ws.send(JSON.stringify({ action: "error", message: "Unauthorized" }));
//       ws.close();
//       return;
//     }

//     try {
//       const decoded = jwtService.verify(token);
//       ws.userId = decoded.id;
//       ws.firstName = decoded.firstName;
//       ws.lastName = decoded.lastName;
//       users.set(ws.userId, ws);
//       console.log(`Користувач ${ws.userId} підключився`);
//     } catch (error) {
//       console.error("[WS AUTH ERROR]:", error.message);
//       ws.send(JSON.stringify({ action: "error", message: "Unauthorized" }));
//       ws.close();
//       return;
//     }

//     ws.on("message", async (message) => {
//       try {
//         const parsedMessage = JSON.parse(message);

//         if (!parsedMessage.action) {
//           throw new Error("Invalid message format");
//         }

//         switch (parsedMessage.action) {
//           case "sendMessage":
//             const { chatRoomId, text, id } = parsedMessage;

//             if (!chatRoomId || !ws.userId || !text) {
//               throw new Error("Missing chat message parameters");
//             }

//             const newMessage = await UserChatRoom.create({
//               chatRoomId,
//               senderId: ws.userId,
//               text,
//               lastReadMessageId: 0,
//               id,
//             });

//             ws.chatRoomId = chatRoomId;

//             wss.clients.forEach((client) => {
//               if (client.readyState === ws.OPEN && client.chatRoomId === ws.chatRoomId) {
//                 client.send(
//                   JSON.stringify({
//                     action: "message",
//                     chatRoomId: ws.chatRoomId,
//                     message: {
//                       id: newMessage.id,
//                       senderId: ws.userId,
//                       text,
//                       createdAt: newMessage.createdAt,
//                       firstName: ws.firstName,
//                       lastName: ws.lastName,
//                     },
//                   })
//                 );
//               }
//             });

//             break;

//           default:
//             throw new Error("Unknown action");
//         }
//       } catch (error) {
//         console.error("[WS ERROR]:", error.message);
//         ws.send(JSON.stringify({ action: "error", message: error.message }));
//       }
//     });

//     ws.on("close", () => {
//       users.forEach((socket, userId) => {
//         if (socket === ws) {
//           users.delete(userId);
//           console.log(`Користувач ${userId} відключився`);
//         }
//       });
//     });

//     ws.on("error", (error) => {
//       console.error("[WS CLIENT ERROR]:", error);
//     });
//   });
// };

// module.exports = { setupWebSocketServer };
