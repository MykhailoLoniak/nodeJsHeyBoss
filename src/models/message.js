const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require("./user");
const { ChatRoom } = require('./chatRoom.js');
// const { UserChatRoom } = require('./userChatRoom.js');

const Message = client.define("message", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chat_room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: ChatRoom, key: "id" },
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: "id" },
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
}, {
  tableName: "messages",
  underscored: true,
});


module.exports = { Message };
