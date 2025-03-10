const { UserChatRoom } = require("../models/userChatRoom");
const { ChatRoom } = require("../models/chatRoom");
const { User } = require("../models/user");
const { where } = require("sequelize");
const { Op } = require('sequelize');
const { ApiError } = require("../exceptions/api.error");



const createChatRoom = async (req, res) => {
  const { name, type, userIds } = req.body;

  if (!name || typeof name !== "string") {
    throw ApiError.badRequest("Invalid or missing chat room name");
  }

  if (!["group", "individual"].includes(type)) {
    throw ApiError.badRequest("Invalid chat room type");
  }


  if (!Array.isArray(userIds)) {
    throw ApiError.badRequest("Invalid userIds format");
  }

  if (type === "group") {
    const room = await ChatRoom.create({ name, type, userIds })

    return res.status(201).json(room);
  }

  if (type === "individual" && userIds.length === 2) {
    const existingRoom = await ChatRoom.findOne({
      where: { type: "individual" },
      include: [
        {
          model: UserChatRoom,
          where: { userId: userIds },
          required: true,
        },
      ],
      having: where("COUNT(DISTINCT UserChatRoom.userId)", "=", 2),
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
};

const getChatRooms = async (req, res) => {
  const { userId } = req.params;

  try {
    const chatRooms = await ChatRoom.findAll();
    const rooms = chatRooms.filter(e => e.userIds.includes(Number(userId)));

    if (rooms.length === 0) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // const rooms = await ChatRoom.findAll();

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const getMessages = async (req, res) => {
  const { chatRoomId, userId } = req.params;

  const chatRoom = await ChatRoom.findByPk(chatRoomId);

  if (!chatRoom) {
    return res.status(404).json({ message: "Chat room not found" });
  }

  if (!chatRoom.userIds.includes(Number(userId))) {
    return res.status(403).json({ message: "User is not part of this chat room" });
  }

  try {
    const messages = await UserChatRoom.findAll({ where: { chatRoomId } });

    if (!messages.length) {
      throw ApiError.notFound("Chat room not found");
    }

    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await User.findOne({ where: { id: message.senderId } });

        return {
          id: message.id,
          senderId: message.senderId,
          text: message.text,
          createdAt: message.createdAt,
          firstName: user ? user.firstName : "Unknown",
          lastName: user ? user.lastName : "User",
        };
      })
    );

    res.status(200).json(messagesWithUsers);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addUserToChat = async (req, res) => {
  const { chatRoomId } = req.params;
  const { userId } = req.body;

  try {
    const chatRoom = await ChatRoom.findByPk(chatRoomId);

    if (!chatRoom) {
      throw ApiError.notFound("Chat room not found");
    }

    if (chatRoom.type !== "group") {
      throw ApiError.badRequest("Users can only be added to group chats");
    }

    await UserChatRoom.create({ userId, chatRoomId });

    res.status(201).json({ message: "User added to chat" });
  } catch (err) {
    console.error("Error adding user to chat:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeUserFromChat = async (req, res) => {
  const { chatRoomId, userId } = req.params;

  try {
    const chatRoom = await ChatRoom.findByPk(chatRoomId);

    if (!chatRoom) {
      throw ApiError.notFound("Chat room not found");
    }

    if (chatRoom.type !== "group") {
      throw ApiError.badRequest("Users can only be removed from group chats");
    }

    await UserChatRoom.destroy({ where: { userId, chatRoomId } });

    res.status(200).json({ message: "User removed from chat" });
  } catch (err) {
    console.error("Error removing user from chat:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteChatRoom = async (req, res) => {
  const { chatRoomId } = req.params;

  try {
    await UserChatRoom.destroy({ where: { chatRoomId } })
    await ChatRoom.destroy({ where: { id: chatRoomId } });

    res.status(200).json({ message: "Chat room deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat room:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateChatRoom = async (req, res) => {
  const { chatRoomId } = req.params;
  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest("Missing chat room name");
  }

  try {
    await ChatRoom.update({ name }, { where: { id: chatRoomId } });

    res.status(200).json({ message: "Chat room updated successfully" });
  } catch (err) {
    console.error("Error updating chat room:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const searchUsers = async (req, res) => {
  const { qwer } = req.params;

  console.log('............................', qwer);


  const users = await User.findAll({
    where: {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${qwer}%` } },
        { lastName: { [Op.iLike]: `%${qwer}%` } }
      ]
    }
  });
  console.log('users', users);

  const arrUsers = users.map(user => [`${user.firstName} ${user.lastName}`, user.id]);

  console.log(arrUsers);
  res.status(200).json(arrUsers)
}



const chatController = {
  createChatRoom,
  getChatRooms,
  getMessages,
  addUserToChat,
  removeUserFromChat,
  updateChatRoom,
  searchUsers,
  deleteChatRoom,
}

// exports.createChatRoom = createChatRoom;
// exports.getChatRooms = getChatRooms;
// exports.getMessages = getMessages;

module.exports = chatController;
