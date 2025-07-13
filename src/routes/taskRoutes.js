const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const router = Router();
const express = require('express');
const controller = require('../controllers/taskController');

// Основні CRUD
router.post('/', catchError(controller.createTask));
router.get('/', catchError(controller.getAllTasks));

router.get('/:taskId', catchError(controller.getTaskById));
router.patch('/:taskId', catchError(controller.updateTask));
router.delete('/:taskId', catchError(controller.deleteTask));

// Дедлайн, статус, старт/пауза
router.patch('/:taskId/deadline', catchError(controller.updateDeadline));
router.patch('/:taskId/status', catchError(controller.updateStatus));
router.post('/:taskId/start', catchError(controller.startTask));
router.post('/:taskId/pause', catchError(controller.pauseTask));

// Дублювання, архівація
router.post('/:taskId/duplicate', catchError(controller.duplicateTask));
router.post('/:taskId/archive', catchError(controller.archiveTask));

// Комунікація
router.post('/:taskId/contractors/:contractorId/message', catchError(controller.messageContractor));
router.post('/:taskId/reassign', catchError(controller.reassignTask));
router.get('/:taskId/candidates', catchError(controller.searchCandidates));

// Рев’ю й затвердження
router.post('/:taskId/review/approve', catchError(controller.approveWork));
router.post('/:taskId/review/request-change', catchError(controller.requestChanges));
router.post('/:taskId/review/feedback', catchError(controller.addFeedback));
router.post('/:taskId/close', catchError(controller.closeTask));

// Логи та звітність
router.get('/:taskId/activity-log', catchError(controller.getActivityLog));
router.get('/:taskId/progress', catchError(controller.getProgress));
router.get('/:taskId/export', catchError(controller.exportSummary));

// Файли та коментарі
router.post('/:taskId/attachments', catchError(controller.uploadAttachment));
router.get('/:taskId/attachments', catchError(controller.getAttachments));
router.post('/:taskId/follow', catchError(controller.followTask));
router.post('/:taskId/comments', catchError(controller.addComment));
router.get('/:taskId/comments', catchError(controller.getComments));

module.exports = router;
