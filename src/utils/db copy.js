require('dotenv/config');
const { Sequelize } = require("sequelize");

const client = new Sequelize({
  host: 'dpg-cv7i7ihc1ekc738pe990-a.oregon-postgres.render.com',
  username: "misha",
  password: "fZVyiAfECbis62yQNdCXE1ZI8GaP5LUv",
  database: "localhost_1u8k",
  dialect: "postgres",
});

module.exports = {
  client,
};
