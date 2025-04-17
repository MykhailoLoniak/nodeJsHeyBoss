const { client } = require('../utils/db');

// Імпортуємо моделі
const { User } = require('./user');
const { Jobs } = require('./jobs');
const { Token } = require('./token');
const { ChatRoom } = require('./chatRoom');
const { UserChatRoom } = require('./userChatRoom');
const { EmployerReview } = require('./employerReviews');
const { EmployerDetails } = require('./employerDetails');
const { ContractorDetails } = require('./contractorDetails');

// 🧩 Асоціації між моделями

User.hasMany(Jobs, { foreignKey: 'user_id' });
Jobs.belongsTo(User, { foreignKey: 'user_id' });

EmployerReview.belongsTo(User, { as: 'reviewedEmployer', foreignKey: 'employer_id' }); // ← alias змінено
EmployerReview.belongsTo(User, { as: 'reviewerUser', foreignKey: 'reviewer_id' });     // ← alias змінено
EmployerReview.belongsTo(Jobs, { foreignKey: 'job_id' });

User.hasMany(UserChatRoom, { foreignKey: 'user_id' });
ChatRoom.hasMany(UserChatRoom, { foreignKey: 'chat_room_id' });

User.hasOne(EmployerDetails, { foreignKey: 'user_id' });
User.hasOne(ContractorDetails, { foreignKey: 'user_id' });

// Експортуємо всі моделі + клієнт
module.exports = {
  client,
  User,
  Jobs,
  Token,
  ChatRoom,
  UserChatRoom,
  EmployerReview,
  EmployerDetails,
  ContractorDetails,
};
