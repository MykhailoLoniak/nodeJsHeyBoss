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
  chat_room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ChatRoom,
      key: "id",
    },
  },
  sender_id: {
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
  last_read_message_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

}, {
  tableName: "userChatRoom",
  underscored: true,
});

// ChatRoom.belongsTo(User, { foreignKey: "userId" });


module.exports = { UserChatRoom };