const { Sequelize } = require('sequelize');

const client = new Sequelize(
  'localhost_3b28', // назва бази з URI
  'misha',          // користувач
  'GRp3HuDHth6ssPfElQVmhyQJqxmw1jQf', // пароль
  {
    host: 'dpg-d17i8sqdbo4c73fvo440-a.oregon-postgres.render.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
);

module.exports = { client };


// require('dotenv/config');

// const { Sequelize } = require("sequelize");

// const client = new Sequelize({
//   host: process.env.DB_HOST,
//   username: process.env.DB_USER,
//   password: String(process.env.DB_PASSWORD),
//   database: process.env.DB_DATABASE,
//   dialect: "postgres",
// });

// module.exports = {
//   client,
// };