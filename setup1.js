require('dotenv/config');
const { Sequelize } = require('sequelize');
const { Token } = require('./src/models/token');
const { User } = require('./src/models/user');
const { ContractorDetails } = require('./src/models/contractorDetails');
const { ChatRoom } = require('./src/models/chatRoom');
const { UserChatRoom } = require('./src/models/userChatRoom');

const client = new Sequelize('postgresql://misha:fZVyiAfECbis62yQNdCXE1ZI8GaP5LUv@dpg-cv7i7ihc1ekc738pe990-a.oregon-postgres.render.com/localhost_1u8k', {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: (msg) => console.log(msg),  // Логування запитів до бази даних
});

async function setup() {
  try {
    // Перевірка підключення до бази
    await client.authenticate();
    console.log('✅ Підключення до бази успішне!');

    // Пробний запит до бази даних
    await client.query('SELECT 1 + 1 AS result')
      .then((result) => {
        console.log('Запит до бази виконано:', result);
      })
      .catch((err) => {
        console.error('❌ Помилка при виконанні запиту:', err);
      });

    // Синхронізація моделей з базою даних
    const models = [Token, User, ContractorDetails, ChatRoom, UserChatRoom];

    for (const model of models) {
      await model.sync({ force: true });
    }

    console.log('✅ Всі таблиці створено!');

  } catch (error) {
    console.error('❌ Помилка під час підключення до бази:', error);
  } finally {
    process.exit(0); // Вихід з процесу після завершення
  }
}

setup();
