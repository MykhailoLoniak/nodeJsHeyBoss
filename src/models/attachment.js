const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

const Attachment = client.define(
  'attachment',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: { type: DataTypes.INTEGER, allowNull: false },
    filename: { type: DataTypes.STRING, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false }
  },
  {
    tableName: 'attachments',
    underscored: true,
  }
);

module.exports = { Attachment };