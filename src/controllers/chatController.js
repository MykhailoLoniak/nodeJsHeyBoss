const { UserChatRoom } = require("../models/userChatRoom");
const { ChatRoom } = require("../models/chatRoom");
const { User } = require("../models/user");
const { where } = require("sequelize");
const { Op } = require('sequelize');
const { ApiError } = require("../exceptions/api.error");
const { EmployerDetails } = require("../models/employerDetails");
const { ContractorDetails } = require("../models/contractorDetails");
const { Message } = require("../models/message");
require('dotenv').config();


const normalizeUser = async ({ email, first_name, id, last_name, role }) => {
  let detailModel;
  if (role === "employer") {
    detailModel = EmployerDetails;
  } else {
    detailModel = ContractorDetails;
  }

  const detail = await detailModel.findOne({ where: { user_id: id } });


  return {
    email,
    first_name,
    user_id: id,
    last_name,
    role,
    avatar: `${process.env.BACKEND_ORIGIN}${detail.dataValues.avatar}`
  }
}

const createChatRoom = async (req, res) => {
  try {
    const { userId, chatPartner } = req.body;

    if (!userId || !chatPartner) {
      throw ApiError.badRequest("Invalid userId or chatPartner");
    }

    const room = await ChatRoom.create({
      user_ids: [userId, chatPartner],

    });

    return res.status(201).json(room);
  } catch (error) {
    console.error("_______________________:", error);
    res.status(500).json({ message: "Internal server error" });
  }

};

const getChatRooms = async (req, res) => {
  const { userId } = req.params;

  try {
    const chatRooms = await ChatRoom.findAll();

    const rooms = chatRooms.filter(e => (e.user_ids.includes(Number(userId))));

    if (rooms.length === 0) {
      return res.status(404).json({ message: "Chat rooms not found" });
    }

    const roomsWithDatail = await Promise.all(
      rooms.map(async room => {
        const members = await UserChatRoom.findAll({
          where: { id: room.id },
        });

        return { ...room, ...members };
      })
    );

    const roomsWithUsers = await Promise.all(
      roomsWithDatail.map(async room => {
        const [user1, user2] = await Promise.all(
          room.dataValues.user_ids.map(id => User.findByPk(id))
        );

        return {
          ...room.dataValues,
          user1: await normalizeUser(user1),
          user2: await normalizeUser(user2),
        };
      })
    );

    const roomWithLastMessage = await Promise.all(
      roomsWithUsers.map(async room => {
        const lastMsg = await Message.findOne({
          where: { chat_room_id: room.id },
          order: [['createdAt', 'DESC']]
        });

        return {
          ...room,
          last_message: lastMsg ? lastMsg.text : null,
          time_message: lastMsg ? lastMsg.createdAt : null,
        };
      })
    );


    res.status(200).json(roomWithLastMessage);
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const getMessages = async (req, res) => {
  const { chatRoomId, userId } = req.params;

  try {
    const messages = await Message.findAll({
      where: { chat_room_id: chatRoomId },
    });

    if (!messages?.length) {
      throw ApiError.notFound("Chat room not found");
    }

    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await User.findOne({ where: { id: message.sender_id } });

        return {
          id: message.id,
          sender_id: message.sender_id,
          text: message.text,
          createdAt: message.createdAt,
          firstName: user ? user.first_name : "Unknown",
          lastName: user ? user.last_name : "User",
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

  const users = await User.findAll({
    where: {
      [Op.or]: [
        { firstName: { [Op.iLike]: `% ${qwer}% ` } },
        { lastName: { [Op.iLike]: `% ${qwer}% ` } }
      ]
    }
  });

  const arrUsers = users.map(user => [`${user.firstName} ${user.lastName} `, user.id]);

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

module.exports = chatController;
