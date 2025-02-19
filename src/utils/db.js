// import { Sequelize } from "sequelize";

const { Sequelize } = require("sequelize");

const client = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: "postgres",
});

// export default client;

module.exports = {
  client,
};
