const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');

// import { DataTypes } from "sequelize";
// import client from "../utils/bd";

const User = client.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
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
    avatarUrl: {
      type: DataTypes.STRING,
    },
    dateOfBirth: {
      type: DataTypes.STRING,
    },
    activationToken: {
      type: DataTypes.STRING,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true, // Це змусить Sequelize використовувати ім'я "user" для таблиці
  }
);

// export default User;
module.exports = {
  User,
};
