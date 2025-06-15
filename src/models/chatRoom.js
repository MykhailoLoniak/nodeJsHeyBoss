const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require("./user");
// const { UserChatRoom } = require('./userChatRoom.js');

const ChatRoom = client.define("chat_room", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_ids: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  },

}, {
  tableName: "chat_rooms",
  underscored: true,
});

module.exports = { ChatRoom };
