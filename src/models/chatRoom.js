const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require("./user");
// const { UserChatRoom } = require('./userChatRoom.js');

const ChatRoom = client.define("chatRoom", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userIds: {
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
});

module.exports = { ChatRoom };
