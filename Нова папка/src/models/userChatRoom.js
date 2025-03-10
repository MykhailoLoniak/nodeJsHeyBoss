const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require("../models/user");
const { ChatRoom } = require('../models/chatRoom.js');

const UserChatRoom = client.define("userChatRoom", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,  // Посилання на модель, а не на назву таблиці
      key: "id",
    },
  },
  chatRoomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ChatRoom, // Посилання на модель
      key: "id",
    },
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Відношення
ChatRoom.hasMany(UserChatRoom, { foreignKey: 'chatRoomId' });
UserChatRoom.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: "chatRoom" });

User.hasMany(UserChatRoom, { foreignKey: 'userId' });
UserChatRoom.belongsTo(User, { foreignKey: 'userId' });

module.exports = { UserChatRoom };
