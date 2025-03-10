require('dotenv/config');
const { Token } = require('./src/models/token');
const { User } = require('./src/models/user');
const { ContractorDetails } = require('./src/models/contractorDetails');
const { ChatRoom } = require('./src/models/chatRoom');
const { UserChatRoom } = require('./src/models/userChatRoom');

const { client } = require('./src/utils/db')

client.sync({ force: true })