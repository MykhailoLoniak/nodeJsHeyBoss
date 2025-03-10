const { DataTypes } = require("sequelize");
const { client } = require('../utils/db.js');
const { User } = require('./user.js');
const { ChatRoom } = require('./chatRoom.js')

const UserChatRoom = client.define("userChatRoom", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chatRoomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ChatRoom,
      key: "id",
    },
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },

  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  lastReadMessageId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
});

// ChatRoom.belongsTo(User, { foreignKey: "userId" });


module.exports = { UserChatRoom };