// models/task.js
const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

const Task = client.define(
  'task',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Open' },
    deadline: { type: DataTypes.DATE },
    archived: { type: DataTypes.BOOLEAN, defaultValue: false },
    timers: { type: DataTypes.JSON, defaultValue: [] }
  },
  {
    tableName: 'tasks',
    underscored: true,
  }
);

module.exports = { Task };