const { DataTypes } = require("sequelize");
const { client } = require('../utils/db.js');

const ChatRoom = client.define("chatRoom", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false, // "group" або "individual"
  },
});

module.exports = { ChatRoom };
