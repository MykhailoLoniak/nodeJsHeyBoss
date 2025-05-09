const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

const User = client.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    activation_token: {
      type: DataTypes.STRING,
    },
    password_reset_token: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "users",
    underscored: true,
  }
);

module.exports = {
  User,
};
