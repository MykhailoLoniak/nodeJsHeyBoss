const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');

const EventShares = client.define(
  'EventShares',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'events', key: 'id' }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    }
  },
  {
    tableName: 'event_shares',
    timestamps: false,
    underscored: true,
  }
);

module.exports = { EventShares };