const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require("./user");
// const { UserChatRoom } = require('./userChatRoom.js');

const Team = client.define("team", {
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
  tableName: "teams",
  underscored: true,
});

module.exports = { ChatRoom };
