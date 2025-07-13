const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

const ActivityLog = client.define(
  'activity_log',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    data: { type: DataTypes.JSON }
  },
  {
    tableName: 'activity_logs',
    underscored: true,
    timestamps: true,
    updatedAt: false
  }
);

module.exports = { ActivityLog };