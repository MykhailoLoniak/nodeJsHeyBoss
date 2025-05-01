const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.js');

const Token = client.define('token', {
  refresh_token: {
    type: DataTypes.STRING(512),
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  table_name: "token",
  underscored: true,
});

module.exports = {
  Token,
};
