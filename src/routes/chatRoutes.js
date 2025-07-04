const { Router } = require("express");
const chatController = require("../controllers/chatController");
const { catchError } = require("../utils/catchError");

const router = Router();

router.get("/", catchError(chatController.getRooms));
router.post("/", catchError(chatController.createChatRoom));
router.get("/:userId/", catchError(chatController.getChatRooms));
router.get("/:chatRoomId/messages/:userId", catchError(chatController.getMessages));

router.delete("/rooms/:chatRoomId", catchError(chatController.deleteChatRoom));
router.get("/users/:qwer", catchError(chatController.searchUsers));

router.delete("/rooms/:chatRoomId/users/:userId", catchError(chatController.removeUserFromChat));
// router.get("/users/:userId/chats", catchError(chatController.getUserChats));
router.post("/rooms/:chatRoomId/users", catchError(chatController.addUserToChat));
router.put("/rooms/:chatRoomId", catchError(chatController.updateChatRoom));

module.exports = router;
