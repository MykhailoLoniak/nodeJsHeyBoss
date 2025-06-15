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
const { Project } = require('./project');
const { Message } = require('./message');
// const { JobExecutors } = require('./jobExecutors');

ReviewFromJobSeeker.belongsTo(User, { as: 'jobSeeker', foreignKey: 'job_seeker_id' });
ReviewFromJobSeeker.belongsTo(User, { as: 'employer', foreignKey: 'employer_id' });
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

ContractorDetails.hasMany(Project, { foreignKey: 'contractor_id' });
Project.belongsTo(ContractorDetails, { foreignKey: 'contractor_id' });


// ChatRoom має багато повідомлень
ChatRoom.hasMany(Message, { foreignKey: "chat_room_id" });
Message.belongsTo(ChatRoom, { foreignKey: "chat_room_id" });

// Користувач має багато повідомлень
User.hasMany(Message, { foreignKey: "sender_id" });
Message.belongsTo(User, { foreignKey: "sender_id" });

// Кімната має багато користувачів
ChatRoom.belongsToMany(User, { through: UserChatRoom, foreignKey: "chat_room_id" });
User.belongsToMany(ChatRoom, { through: UserChatRoom, foreignKey: "user_id" });

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
  Message

};
