const { Sequelize } = require('sequelize');

const client = new Sequelize(
  'localhost_u5tt', // Назва бази даних
  'misha',          // Ім'я користувача
  'RVCRoVMOyuTzdKsk2tasZwpZctzBcoKE', // Пароль
  {
    host: 'dpg-d0f348re5dus738oro60-a.oregon-postgres.render.com', // Хост
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // не перевіряє сертифікат
      }
    },
    logging: false // вимикає SQL-логи
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