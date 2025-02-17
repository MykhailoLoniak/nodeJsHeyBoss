// import User from "./user";
// import client from "../utils/bd";
// import { DataTypes } from "sequelize";

const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.js');

const Token = client.define("token", {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

// export default Token;
module.exports = {
  Token,
};
