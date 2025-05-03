require('dotenv/config');
// const { Job } = require('./src/models/job');
// const { User } = require('./src/models/user');
// const { Token } = require('./src/models/token');
// const { ChatRoom } = require('./src/models/chatRoom');
// const { UserChatRoom } = require('./src/models/userChatRoom');
// const { EmployerDetails } = require('./src/models/employerDetails');
// const { ContractorDetails } = require('./src/models/contractorDetails');
// const { ReviewFromJobSeeker } = require('./src/models/reviewFromJobSeeker');
// const { ReviewFromEmployer } = require('./src/models/reviewFromEmployer');
// // const { JobsExecutors } = require("./src/models/jobExecutors");
const models = require('./src/models');

const { client } = require('./src/utils/db');
const data = require('./arr');

async function setup() {
  try {
    console.log('Моделі:', Object.keys(models.client.models));

    await client.sync({ alter: true });
    console.log('📦 База даних синхронізована.');

    // Створення початкових користувачів
    await models.User.bulkCreate(data.users);
    await models.ContractorDetails.bulkCreate(data.contractorDetails);
    await models.EmployerDetails.bulkCreate(data.employerDetails);
    await models.Job.bulkCreate(data.jobs);
    await models.ReviewFromJobSeeker.bulkCreate(data.reviewsEmployer);
    await models.ReviewFromEmployer.bulkCreate(data.reviewsJobSeeker);

    console.log('✅ Початкові дані додано.');
  } catch (error) { console.error('❌ Помилка при ініціалізації:', error); } finally { await client.close(); }
}

setup();