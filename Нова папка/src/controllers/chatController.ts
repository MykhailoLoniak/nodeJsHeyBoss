const { UserChatRoom } = require("../models/userChatRoom");
const { ChatRoom } = require("../models/chatRoom");
const { User: UserModels } = require("../models/user");

const createChatRoom = async (req, res) => {
  const { name, type, userIds } = req.body;
  console.log("Creating chat room with data:", req.body);

  // Переконуємось, що userIds - це масив
  if (!Array.isArray(userIds)) {
    return res.status(400).json({ message: "Invalid userIds format" });
  }

  if (type === "group") {
    try {
      const room = await ChatRoom.create({ name, type })

      // Додаємо тільки того, хто створив чат
      await UserChatRoom.create({ userId: req.user.id, chatRoomId: room.id });

      return res.status(201).json(room);
    } catch (err) {
      console.log("Error creating:::::::::::", err);
    }

    if (type === "individual" && userIds.length === 2) {
      // Перевіряємо, чи існує вже такий діалог
      const existingRoom = await UserChatRoom.findOne({
        where: { userId: userIds[0] },
        include: [{ model: ChatRoom, where: { type: "individual" } }],
      });

      if (existingRoom) {
        return res.status(200).json(existingRoom.chatRoom);
      }

      const room = await ChatRoom.create({
        name: `Chat between ${userIds[0]} and ${userIds[1]}`,
        type,
      });

      await UserChatRoom.bulkCreate(
        userIds.map((userId) => ({ userId, chatRoomId: room.id }))
      );

      return res.status(201).json(room);
    }

    return res.status(400).json({ message: "Invalid data for chat creation" });
  }
};

const addUserToGroupChat = async (req, res) => {
  const { chatRoomId, userId } = req.body;

  try {
    const chatRoom = await ChatRoom.findByPk(chatRoomId);
    if (!chatRoom || chatRoom.type !== "group") {
      return res.status(404).json({ message: "Group chat not found" });
    }

    const existingUser = await UserChatRoom.findOne({
      where: { chatRoomId, userId },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already in chat" });
    }

    await UserChatRoom.create({ chatRoomId, userId });
    return res.status(200).json({ message: "User added to group chat" });
  } catch (err) {
    console.error("Error adding user to group chat:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserChats = async (req, res) => {
  const userId = req.params.userId;

  try {
    const userChatRooms = await UserChatRoom.findAll({
      where: { userId },
      include: [{ model: ChatRoom, as: "chatRoom" }],
    });

    if (!userChatRooms.length) {
      return res.status(404).json({ message: "No chats found for this user" });
    }

    return res.status(200).json(userChatRooms.map((uc) => uc.chatRoom));
  } catch (err) {
    console.error("Error fetching user chats:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.createChatRoom = createChatRoom;
exports.getUserChats = getUserChats;
exports.addUserToGroupChat = addUserToGroupChat;

// const { UserChatRoom } = require("../models/userChatRoom");
// const { ChatRoom } = require("../models/chatRoom");
// const { User: UserModels } = require("../models/user");

// const createChatRoom = async (req, res) => {
//   const { name, type, userIds } = req.body;
//   console.log("....................................................", req.body);

//   try {
//     if (type === "group" && userIds.length >= 2) {
//       // Створення групового чату
//       const room = await ChatRoom.create({
//         name,
//         type,
//       });

//       // Додаємо кожного користувача до таблиці UserChatRoom
//       for (const userId of userIds) {
//         await UserChatRoom.create({
//           userId,
//           chatRoomId: room.id,
//         });
//       }

//       return res.status(201).json(room);
//     } else if (type === "individual" && userIds.length === 2) {
//       // Створення індивідуального чату
//       const room = await ChatRoom.create({
//         name: `Chat between ${userIds[0]} and ${userIds[1]}`,
//         type,
//       });

//       // Додаємо кожного користувача до таблиці UserChatRoom
//       for (const userId of userIds) {
//         await UserChatRoom.create({
//           userId,
//           chatRoomId: room.id,
//         });
//       }

//       return res.status(201).json(room);
//     } else {
//       return res
//         .status(400)
//         .json({ message: "Invalid data for chat creation" });
//     }
//   } catch (err) {
//     console.log("error_______________________:", err);
//   }
// };

// const getUserChats = async (req, res) => {
//   const userId = req.params.userId;

//   // Знайдемо всі chatRoomId, до яких належить користувач
//   const userChatRooms = await UserChatRoom.findAll({
//     where: { userId },
//     include: [
//       {
//         model: ChatRoom,
//         as: "chatRoom", // Це зв'язок між таблицями UserChatRoom і ChatRoom
//       },
//     ],
//   });

//   if (!userChatRooms.length) {
//     return res.status(404).json({ message: "No chats found for this user" });
//   }

//   // Повертаємо чати користувача
//   return res.status(200).json(userChatRooms.map((uc) => uc.chatRoom));
// };

// exports.createChatRoom = createChatRoom;
// exports.getUserChats = getUserChats;
