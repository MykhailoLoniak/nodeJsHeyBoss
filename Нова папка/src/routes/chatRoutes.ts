// routes/chatRouter.js

const {Router : RouterChat} = require("express");
const chatController = require("../controllers/chatController");
const { catchError: catchErrorsChat } = require("../utils/catchError");

const routerChat = RouterChat();

routerChat.post("/create", catchErrorsChat(chatController.createChatRoom));
routerChat.get("/:userId", catchErrorsChat(chatController.getUserChats));

module.exports = routerChat;
