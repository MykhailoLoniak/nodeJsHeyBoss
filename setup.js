require('dotenv/config');
const { Jobs } = require('./src/models/jobs');
const { User } = require('./src/models/user');
const { Token } = require('./src/models/token');
const { ChatRoom } = require('./src/models/chatRoom');
const { UserChatRoom } = require('./src/models/userChatRoom');
const { EmployerReview } = require('./src/models/employerReviews');
const { EmployerDetails } = require('./src/models/employerDetails');
const { ContractorDetails } = require('./src/models/contractorDetails');
const { JobsExecutors } = require("./src/models/jobExecutors")

const { client } = require('./src/utils/db');
const data = require('./arr');

async function setup() {
  try {
    await client.sync({ force: true });
    console.log('📦 База даних синхронізована.');

    // Створення початкових користувачів
    await User.bulkCreate(data.users);
    await ContractorDetails.bulkCreate(data.contractorDetails);
    await EmployerDetails.bulkCreate(data.employerDetails);
    await Jobs.bulkCreate(data.jobs);

    console.log('✅ Початкові дані додано.');
  } catch (error) { console.error('❌ Помилка при ініціалізації:', error); } finally { await client.close(); }
}

setup();