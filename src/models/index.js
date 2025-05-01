const { client } = require('../utils/db');

const { User } = require('./user');
const { Job } = require('./job');
const { Token } = require('./token');
const { ChatRoom } = require('./chatRoom');
const { UserChatRoom } = require('./userChatRoom');
const { EmployerDetails } = require('./employerDetails');
const { ContractorDetails } = require('./contractorDetails');
const { ReviewFromJobSeeker } = require('./reviewFromJobSeeker');
const { ReviewFromEmployer } = require('./reviewFromEmployer');
// const { JobExecutors } = require('./jobExecutors');


// User.hasMany(Job, { foreignKey: 'user_id' });
// Job.belongsTo(User, { foreignKey: 'user_id' });


// User.hasMany(UserChatRoom, { foreignKey: 'user_id' });
// ChatRoom.hasMany(UserChatRoom, { foreignKey: 'chat_room_id' });

// User.hasOne(EmployerDetails, { foreignKey: 'user_id' });
// User.hasOne(ContractorDetails, { foreignKey: 'user_id' });

// Хто залишив відгук — пошукач
ReviewFromJobSeeker.belongsTo(User, { as: 'jobSeeker', foreignKey: 'job_seeker_id' });
// Кому залишили відгук — роботодавець
ReviewFromJobSeeker.belongsTo(User, { as: 'employer', foreignKey: 'employer_id' });
// На яку роботу
ReviewFromJobSeeker.belongsTo(Job, { foreignKey: 'job_id' });


ReviewFromEmployer.belongsTo(User, { as: 'employer', foreignKey: 'employer_id' }); // Хто залишає відгук
ReviewFromEmployer.belongsTo(User, { as: 'jobSeeker', foreignKey: 'job_seeker_id' }); // Кому залишено відгук
ReviewFromEmployer.belongsTo(Job, { foreignKey: 'job_id' });

ContractorDetails.belongsTo(User, { foreignKey: "user_id" });
EmployerDetails.belongsTo(User, { foreignKey: "user_id" });
Job.belongsTo(User, { foreignKey: "company_id" });

// JobExecutors.belongsTo(Job, { foreignKey: "job_id" });
// JobExecutors.belongsTo(User, { foreignKey: "user_id" });

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Token, { foreignKey: 'userId' });


// Експортуємо всі моделі + клієнт
module.exports = {
  client,
  User,
  Job,
  Token,
  ChatRoom,
  UserChatRoom,
  // EmployerReview,
  EmployerDetails,
  ContractorDetails,
  ReviewFromJobSeeker,
  ReviewFromEmployer,
};
