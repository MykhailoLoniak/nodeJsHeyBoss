const { Sequelize } = require("sequelize");
const { User } = require("./src/models/user");
const { ChatRoom } = require("./src/models/chatRoom");
const { ContractorDetails } = require("./src/models/contractorDetails");
const { Token } = require("./src/models/token");
const { UserChatRoom } = require("./src/models/userChatRoom");

// Підключення до бази даних
const client = new Sequelize(
  "postgresql://misha:fZVyiAfECbis62yQNdCXE1ZI8GaP5LUv@dpg-cv7i7ihc1ekc738pe990-a.oregon-postgres.render.com/localhost_1u8k",
  {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

// Функція для синхронізації моделей
async function syncDatabase() {
  try {
    console.log("Синхронізація таблиць...");

    // Переконайтеся, що підключення працює
    await client.authenticate();
    console.log("Підключення до бази успішне!");

    // Видаляє і створює таблиці заново
    await client.sync({ force: true });

    console.log("Таблиці були успішно створені!");

  } catch (error) {
    console.error("Помилка при синхронізації таблиць:", error);
  } finally {
    // Закриваємо підключення
    await client.close();
  }
}

// Викликаємо функцію
syncDatabase();
