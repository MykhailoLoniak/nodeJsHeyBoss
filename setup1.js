require('dotenv/config');
const {
  client,
  User,
  Jobs,
  Token,
  ChatRoom,
  UserChatRoom,
  EmployerReview,
  EmployerDetails,
  ContractorDetails,
} = require('./src/models');

console.log('📦 Початок ініціалізації моделей...');

console.log('✅ Всі моделі були успішно імпортовані!');
console.log('🧪 Перевірка з’єднання з базою даних...');

client.authenticate()
  .then(() => {
    console.log('✅ З’єднання з базою даних успішне!');
    console.log('🔄 Спроба синхронізації моделей з базою даних...');
    return client.sync({ force: true, alter: true }); // використовуй тільки force або alter, не разом
  })
  .then(async () => {
    console.log('✅ Всі таблиці були успішно створені!');

    const [results] = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);

    console.log('\n📋 Таблиці у public:');
    results.forEach((row) => {
      console.log('🧾', row.table_name);
    });

    process.exit();
  })
  .catch((err) => {
    console.error('❌ Помилка при ініціалізації:', err);
    process.exit(1);
  });
