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
const { Event } = require('./event');
const { EventShares } = require('./event_shares');
const { Task } = require('./task');
const { Attachment } = require('./attachment');
const { ActivityLog } = require('./activityLog');
const { Team } = require('./team')
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

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Token, { foreignKey: 'userId' });

ContractorDetails.hasMany(Project, { foreignKey: 'contractor_id' });
Project.belongsTo(ContractorDetails, { foreignKey: 'contractor_id' });

ChatRoom.hasMany(Message, { foreignKey: "chat_room_id" });
Message.belongsTo(ChatRoom, { foreignKey: "chat_room_id" });

User.hasMany(Message, { foreignKey: "sender_id" });
Message.belongsTo(User, { foreignKey: "sender_id" });

ChatRoom.belongsToMany(User, { through: UserChatRoom, foreignKey: "chat_room_id" });
User.belongsToMany(ChatRoom, { through: UserChatRoom, foreignKey: "user_id" });

Event.belongsTo(User, { foreignKey: 'user_id', as: 'organizer' });
User.hasMany(Event, { foreignKey: 'user_id', as: 'createdEvents' });


// Зв'язок Task ↔ Attachment
Task.hasMany(Attachment, { foreignKey: 'task_id', as: 'attachments' });
Attachment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

// Зв'язок Task ↔ ActivityLog
Task.hasMany(ActivityLog, { foreignKey: 'task_id', as: 'activityLogs' });
ActivityLog.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

Event.belongsToMany(User, {
  through: EventShares,
  foreignKey: 'event_id',
  otherKey: 'user_id',
  as: 'attendees'
});
User.belongsToMany(Event, {
  through: EventShares,
  foreignKey: 'user_id',
  otherKey: 'event_id',
  as: 'attendingEvents'
});

User.hasMany(Task, {
  foreignKey: 'user_id',
  as: 'tasks'
});

Task.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'owner'
});

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
  Message,
  Event,
  EventShares,
  Task,
  Attachment,
  Team,
  ActivityLog
};
