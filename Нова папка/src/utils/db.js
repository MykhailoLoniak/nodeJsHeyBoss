require('dotenv/config');
const { Sequelize } = require("sequelize");

const client = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_DATABASE,
  dialect: "postgres",
});

module.exports = {
  client,
};
