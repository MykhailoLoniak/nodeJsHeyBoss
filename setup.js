require('dotenv/config');
const { Jobs } = require('./src/models/jobs');
const { User } = require('./src/models/user');
const { Token } = require('./src/models/token');
const { ChatRoom } = require('./src/models/chatRoom');
const { UserChatRoom } = require('./src/models/userChatRoom');
const { EmployerReview } = require('./src/models/employerReviews');
const { EmployerDetails } = require('./src/models/employerDetails');
const { ContractorDetails } = require('./src/models/contractorDetails');

const { client } = require('./src/utils/db')

client.sync({ force: true })