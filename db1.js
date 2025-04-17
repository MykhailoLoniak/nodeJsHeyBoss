// src/utils/db.js
const { Sequelize } = require('sequelize');

const client = new Sequelize(
  'localhost_1u8k_q5j8', // Назва бази даних
  'misha',               // Ім'я користувача
  'AcDw1wAJbFSkVFuxl700M1NEuMQe1eKQ', // Пароль
  {
    host: 'dpg-cvqoitje5dus73dloe3g-a.oregon-postgres.render.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // або true якщо маєш сертифікат
      }
    },
    logging: false, // якщо не хочеш бачити SQL запити в консолі
  }
);

module.exports = { client };
