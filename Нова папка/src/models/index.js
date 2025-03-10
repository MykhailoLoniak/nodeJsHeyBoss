// models/index.js

const { User } = require("./user");
const { ChatRoom } = require("./chatRoom");
const { UserChatRoom } = require("./userChatRoom");

User.belongsToMany(ChatRoom, {
  through: UserChatRoom,
  foreignKey: "userId",
});
ChatRoom.belongsToMany(User, {
  through: UserChatRoom,
  foreignKey: "chatRoomId",
});

module.exports = { User, ChatRoom, UserChatRoom };
