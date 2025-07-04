const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require("./user");
// const { UserChatRoom } = require('./userChatRoom.js');

const Task = client.define("task", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_ids: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  },
  task_name: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  objectives: {
    type: DataTypes.STRING,
  },
  deliverables: {
    type: DataTypes.STRING,
  },
  optional: {
    type: DataTypes.STRING,
  },
  google_link: {
    type: DataTypes.STRING,
  },
  print: {
    type: DataTypes.STRING,
  },
  photo: {
    type: DataTypes.STRING,
  },
  file: {
    type: DataTypes.STRING,
  },
  img: {
    type: DataTypes.STRING,
  },
  doc: {
    type: DataTypes.STRING,
  },

}, {
  tableName: "tasks",
  underscored: true,
});

module.exports = { ChatRoom };
