const { Router } = require("express");
const chatController = require("../controllers/chatController");
const { catchError } = require("../utils/catchError");

const routerChat = Router();

routerChat.post("/", catchError(chatController.createChatRoom));
routerChat.get("/rooms/:userId", catchError(chatController.getChatRooms));
routerChat.get("/rooms/:chatRoomId/messages/:userId", catchError(chatController.getMessages));
routerChat.delete("/rooms/:chatRoomId", catchError(chatController.deleteChatRoom)); //повне видалення чату


routerChat.get("/users/:qwer", catchError(chatController.searchUsers));

routerChat.delete("/rooms/:chatRoomId/users/:userId", catchError(chatController.removeUserFromChat));
// routerChat.get("/users/:userId/chats", catchError(chatController.getUserChats));
routerChat.post("/rooms/:chatRoomId/users", catchError(chatController.addUserToChat));
routerChat.put("/rooms/:chatRoomId", catchError(chatController.updateChatRoom));

module.exports = routerChat;
