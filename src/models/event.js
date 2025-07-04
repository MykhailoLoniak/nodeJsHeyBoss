const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');

const Event = client.define(
  'Event',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // назва таблиці User
        key: 'id',
      }
    }
  },
  {
    tableName: 'events',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { Event };