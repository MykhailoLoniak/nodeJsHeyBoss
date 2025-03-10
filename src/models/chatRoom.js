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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
},{
  tableName: "chatRoom",
  underscored: true,
});

module.exports = { ChatRoom };
