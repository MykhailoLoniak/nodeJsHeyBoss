// src/ws/setupWebSocketServer.js
const ws = require("ws");
const { jwtService } = require("../services/jwtService");
const { Message } = require("../models/message");
const { UserChatRoom } = require("../models/userChatRoom");
const { ChatRoom } = require("../models/chatRoom");  // імпорт моделі чат-румів

// Map<userId, ws>
const users = new Map();
// Map<chatRoomId, Set<ws>>
const roomMembers = new Map();

// Повертає масив користувачів, під’єднаних саме до цієї кімнати
function getOnlineInRoom(roomId) {
  const members = roomMembers.get(String(roomId)) || new Set();
  return [...members].map(c => ({
    id: c.userId,
    firstName: c.firstName,
    lastName: c.lastName,
  }));
}

// Шле payload ▲ тільки клієнтам конкретної кімнати
function broadcastRoom(roomId, payload) {
  const members = roomMembers.get(String(roomId)) || new Set();
  for (const client of members) {
    if (client.readyState === ws.OPEN) client.send(payload);
  }
}


function subscribe(wsClient, roomId) {
  wsClient.chatRoomIds = wsClient.chatRoomIds || new Set();
  if (!wsClient.chatRoomIds.has(roomId)) {
    wsClient.chatRoomIds.add(roomId);

    if (!roomMembers.has(roomId)) roomMembers.set(roomId, new Set());
    roomMembers.get(roomId).add(wsClient);

    // ⏩ після приєднання — розсилаємо оновлений список
    broadcastRoom(roomId, JSON.stringify({
      action: 'roomUsers',
      chatRoomId: roomId,
      users: getOnlineInRoom(roomId),
    }));
  }
}

function unsubscribe(wsClient, roomId) {
  if (wsClient.chatRoomIds?.has(roomId)) {
    wsClient.chatRoomIds.delete(roomId);
    const members = roomMembers.get(roomId);
    members?.delete(wsClient);
    if (members?.size === 0) roomMembers.delete(roomId);

    // ⏩ після виходу — теж розсилаємо оновлений список
    broadcastRoom(roomId, JSON.stringify({
      action: 'roomUsers',
      chatRoomId: roomId,
      users: getOnlineInRoom(roomId),
    }));
  }
}


// function subscribe(wsClient, chatRoomId) {
//   wsClient.chatRoomIds = wsClient.chatRoomIds || new Set();
//   if (!wsClient.chatRoomIds.has(chatRoomId)) {
//     wsClient.chatRoomIds.add(chatRoomId);
//     if (!roomMembers.has(chatRoomId)) {
//       roomMembers.set(chatRoomId, new Set());
//     }
//     roomMembers.get(chatRoomId).add(wsClient);
//   }
// }

// function unsubscribe(wsClient, chatRoomId) {
//   if (wsClient.chatRoomIds?.has(chatRoomId)) {
//     wsClient.chatRoomIds.delete(chatRoomId);
//     const members = roomMembers.get(chatRoomId);
//     members?.delete(wsClient);
//     if (members?.size === 0) {
//       roomMembers.delete(chatRoomId);
//     }
//   }
// }

const setupWebSocketServer = (server) => {
  const wss = new ws.Server({ server });

  wss.on("connection", async (wsClient, req) => {
    // 1) Аутентифікація
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const token = urlParams.get('token');
    if (!token) {
      wsClient.send(JSON.stringify({ action: "error", message: "Unauthorized" }));
      return wsClient.close();
    }

    let decoded;
    try {
      decoded = jwtService.verify(token);
      if (!decoded?.id) throw new Error("Invalid token payload");
    } catch (err) {
      console.error("[WS AUTH ERROR]:", err.message);
      wsClient.send(JSON.stringify({ action: "error", message: "Unauthorized" }));
      return wsClient.close();
    }

    // Ініціалізація полів
    wsClient.chatRoomIds = new Set();
    wsClient.userId = decoded.id;
    wsClient.firstName = decoded.firstName;
    wsClient.lastName = decoded.lastName;
    users.set(wsClient.userId, wsClient);
    console.log(`🟢 User ${wsClient.userId} connected`);

    // 2) Автопідписка на всі кімнати, де юзер є учасником
    try {
      const allRooms = await ChatRoom.findAll();
      for (const room of allRooms) {
        if (room.user_ids.includes(wsClient.userId)) {
          subscribe(wsClient, String(room.id));
        }
      }
      console.log(`✅ User ${wsClient.userId} auto-subscribed to rooms:`, [...wsClient.chatRoomIds]);
    } catch (err) {
      console.error("[WS SUBSCRIBE ERROR]:", err);
    }

    // 3) Обробка вхідних повідомлень
    wsClient.on("message", async raw => {
      let msg;
      try {
        msg = JSON.parse(raw);
        if (!msg.action) throw new Error("Invalid message format");
      } catch (err) {
        console.error("[WS PARSE ERROR]:", err.message);
        return wsClient.send(JSON.stringify({ action: "error", message: err.message }));
      }

      try {
        switch (msg.action) {
          case "read": {
            const { chatRoomId, messageId } = msg;
            if (!chatRoomId || !messageId) throw new Error("Missing parameters for read");

            // 1. Upsert last_read_message_id
            await UserChatRoom.upsert(
              {
                chat_room_id: chatRoomId,
                user_id: wsClient.userId,
                last_read_message_id: messageId
              },
              { conflictFields: ["chat_room_id", "user_id"] }
            );

            // 2. Broadcast to other members
            const members = roomMembers.get(String(chatRoomId)) || new Set();
            const payload = JSON.stringify({
              action: "read",
              chatRoomId,
              userId: wsClient.userId,
              lastReadMessageId: messageId,
            });
            for (const client of members) {
              if (client !== wsClient && client.readyState === ws.OPEN) {
                client.send(payload);
              }
            }
            break;
          }

          case "join": {
            const { chatRoomId } = msg;
            if (!chatRoomId) throw new Error("Missing chatRoomId for join");
            const roomId = String(chatRoomId);
            subscribe(wsClient, roomId);

            // відразу після subscribe всередині авто-join
            wsClient.send(JSON.stringify({
              action: 'roomUsers',
              chatRoomId: roomId,
              users: getOnlineInRoom(roomId),
            }));

            console.log(`🔔 User ${wsClient.userId} joined room ${roomId}`);

            // Після підписки — віддаємо початковий lastRead
            const row = await UserChatRoom.findOne({
              where: { chat_room_id: roomId, user_id: wsClient.userId },
              attributes: ['last_read_message_id']
            });
            const lastReadId = row?.last_read_message_id || null;
            wsClient.send(JSON.stringify({
              action: "lastRead",
              chatRoomId: roomId,
              lastReadMessageId: lastReadId,
            }));
            break;
          }

          case "leave": {
            const { chatRoomId } = msg;
            if (!chatRoomId) throw new Error("Missing chatRoomId for leave");
            unsubscribe(wsClient, String(chatRoomId));
            console.log(`🔕 User ${wsClient.userId} left room ${chatRoomId}`);
            break;
          }

          case "sendMessage": {
            const { chatRoomId, text } = msg;
            if (!chatRoomId || !text) throw new Error("Missing chat message parameters");

            // 3.1) Зберігаємо в БД
            const newMessage = await Message.create({
              chat_room_id: chatRoomId,
              sender_id: wsClient.userId,
              text,
            });

            // 3.2) Гарантуємо, що автор підписаний
            subscribe(wsClient, String(chatRoomId));

            // 3.3) Розсилаємо всім
            const members = roomMembers.get(String(chatRoomId)) || new Set();
            const payload = JSON.stringify({
              action: "message",
              chatRoomId,
              message: {
                id: newMessage.id,
                sender_id: wsClient.userId,
                text: newMessage.text,
                createdAt: newMessage.createdAt,
                firstName: wsClient.firstName,
                lastName: wsClient.lastName,
              },
            });
            for (const client of members) {
              if (client.readyState === ws.OPEN) {
                client.send(payload);
              }
            }
            break;
          }

          default:
            throw new Error("Unknown action: " + msg.action);
        }
      } catch (err) {
        console.error("[WS ERROR]:", err.message);
        wsClient.send(JSON.stringify({ action: "error", message: err.message }));
      }
    });

    // 4) При закритті — чистимо
    wsClient.on("close", () => {
      users.delete(wsClient.userId);
      for (const roomId of wsClient.chatRoomIds || []) {
        unsubscribe(wsClient, roomId);
      }
      console.log(`⚪️ User ${wsClient.userId} disconnected`);
    });

    wsClient.on("error", err => {
      console.error("[WS CLIENT ERROR]:", err);
    });
  });
};

module.exports = { setupWebSocketServer };


// // src/ws/setupWebSocketServer.js
// const ws = require("ws");
// const { jwtService } = require("../services/jwtService");
// const { Message } = require("../models/message");
// const { UserChatRoom } = require("../models/userChatRoom");
// const { ChatRoom } = require("../models/chatRoom");

// // Map<userId, ws>
// const users = new Map();
// // Map<chatRoomId, Set<ws>>
// const roomMembers = new Map();

// function subscribe(ws, chatRoomId) {
//   ws.chatRoomIds = ws.chatRoomIds || new Set();
//   if (!ws.chatRoomIds.has(chatRoomId)) {
//     ws.chatRoomIds.add(chatRoomId);
//     if (!roomMembers.has(chatRoomId)) {
//       roomMembers.set(chatRoomId, new Set());
//     }
//     roomMembers.get(chatRoomId).add(ws);
//   }
// }

// function unsubscribe(ws, chatRoomId) {
//   if (ws.chatRoomIds?.has(chatRoomId)) {
//     ws.chatRoomIds.delete(chatRoomId);
//     const members = roomMembers.get(chatRoomId);
//     members?.delete(ws);
//     if (members?.size === 0) {
//       roomMembers.delete(chatRoomId);
//     }
//   }
// }

// const setupWebSocketServer = (server) => {
//   const wss = new ws.Server({ server });

//   wss.on("connection", async (ws, req) => {
//     // 1) Аутентифікація
//     const urlParams = new URLSearchParams(req.url.split('?')[1]);
//     const token = urlParams.get('token');
//     if (!token) {
//       ws.send(JSON.stringify({ action: "error", message: "Unauthorized" }));
//       return ws.close();
//     }

//     let decoded;
//     try {
//       decoded = jwtService.verify(token);
//       if (!decoded?.id) throw new Error("Invalid token payload");
//     } catch (err) {
//       console.error("[WS AUTH ERROR]:", err.message);
//       ws.send(JSON.stringify({ action: "error", message: "Unauthorized" }));
//       return ws.close();
//     }

//     ws.chatRoomIds = new Set();

//     ws.userId = decoded.id;
//     ws.firstName = decoded.firstName;
//     ws.lastName = decoded.lastName;
//     users.set(ws.userId, ws);
//     console.log(`🟢 User ${ws.userId} connected`);

//     // 2) Автопідписка на всі кімнати цього користувача
//     try {
//       const allRooms = await ChatRoom.findAll();
//       for (const room of allRooms) {
//         if (room.user_ids.includes(ws.userId)) {
//           subscribe(ws, String(room.id));
//         }
//       }
//       console.log(`✅ User ${ws.userId} auto-subscribed to rooms:`, [...ws.chatRoomIds]);

//     } catch (err) {
//       console.error("[WS SUBSCRIBE ERROR]:", err);
//     }

//     // 3) Обробка вхідних повідомлень
//     ws.on("message", async raw => {
//       let msg;
//       try {
//         msg = JSON.parse(raw);
//         if (!msg.action) throw new Error("Invalid message format");
//       } catch (err) {
//         console.error("[WS PARSE ERROR]:", err.message);
//         return ws.send(JSON.stringify({ action: "error", message: err.message }));
//       }

//       try {
//         switch (msg.action) {
//           case "read": {
//             const { chatRoomId, messageId } = msg;
//             if (!chatRoomId || !messageId) throw new Error("Missing parameters for read");

//             // 1. Записуємо/оновлюємо last_read_message_id
//             await UserChatRoom.upsert(
//               { chat_room_id: chatRoomId, user_id: ws.userId, last_read_message_id: messageId },
//               { conflictFields: ["chat_room_id", "user_id"] }
//             );

//             // 2. Розсилаємо усім іншим учасникам тієї ж кімнати подію про прочитання
//             const members = roomMembers.get(String(chatRoomId)) || new Set();
//             const payload = JSON.stringify({
//               action: "read",
//               chatRoomId,
//               userId: ws.userId,
//               lastReadMessageId: messageId,
//             });
//             for (const client of members) {
//               if (client !== ws && client.readyState === ws.OPEN) {
//                 client.send(payload);
//               }
//             }
//             break;
//           }


//           case "join": {
//             if (!msg.chatRoomId) throw new Error("Missing chatRoomId for join");
//             const roomId = String(msg.chatRoomId);
//             subscribe(ws, roomId);
//             console.log(`🔔 User ${ws.userId} joined room ${roomId}`);

//             // —————————————————————————————————————————————————————
//             // Після підписки: дістаємо last_read_message_id з БД
//             const row = await UserChatRoom.findOne({
//               where: {
//                 chat_room_id: roomId,
//                 user_id: ws.userId,
//               },
//               attributes: ['last_read_message_id'],
//             });
//             const lastReadId = row?.last_read_message_id || null;

//             // Шлемо клієнту, щоб він знав, до якого повідомлення він вже
//             // вважається «прочитаним»
//             ws.send(JSON.stringify({
//               action: "lastRead",
//               chatRoomId: roomId,
//               lastReadMessageId: lastReadId,
//             }));
//             // —————————————————————————————————————————————————————

//             break;
//           }

//           case "leave":
//             if (!msg.chatRoomId) throw new Error("Missing chatRoomId for leave");
//             unsubscribe(ws, String(msg.chatRoomId));
//             console.log(`🔕 User ${ws.userId} left room ${msg.chatRoomId}`);
//             break;

//           case "sendMessage": {
//             const { chatRoomId, text } = msg;
//             if (!chatRoomId || !text) throw new Error("Missing chat message parameters");

//             // 3.1) Зберегти в БД
//             const newMessage = await Message.create({
//               chat_room_id: chatRoomId,
//               sender_id: ws.userId,
//               text,
//             });

//             // 3.2) Переконатися, що автор підписаний
//             subscribe(ws, String(chatRoomId));

//             // 3.3) Розіслати всім у кімнаті
//             const members = roomMembers.get(String(chatRoomId)) || [];
//             const payload = JSON.stringify({
//               action: "message",
//               chatRoomId,
//               message: {
//                 id: newMessage.id,
//                 sender_id: ws.userId,
//                 text: newMessage.text,
//                 createdAt: newMessage.createdAt,
//                 firstName: ws.firstName,
//                 lastName: ws.lastName,
//               },
//             });
//             for (const client of members) {
//               if (client.readyState === ws.OPEN) {
//                 client.send(payload);
//               }
//             }
//             break;
//           }

//           default:
//             throw new Error("Unknown action: " + msg.action);
//         }
//       } catch (err) {
//         console.error("[WS ERROR]:", err.message);
//         ws.send(JSON.stringify({ action: "error", message: err.message }));
//       }
//     });

//     // 4) Очистка при закритті зʼєднання
//     ws.on("close", () => {
//       // Видалити з users
//       users.delete(ws.userId);
//       // Видалити з усіх кімнат
//       for (const roomId of ws.chatRoomIds || []) {
//         unsubscribe(ws, roomId);
//       }
//       console.log(`⚪️ User ${ws.userId} disconnected`);
//     });

//     ws.on("error", err => {
//       console.error("[WS CLIENT ERROR]:", err);
//     });
//   });
// };

// module.exports = { setupWebSocketServer };

