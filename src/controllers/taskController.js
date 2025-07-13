// controllers/tasksController.js
// Контролери для обробки бізнес-логіки завдань

const taskService = require('../services/taskService');

// Визначення кожної функції окремо
async function getAllTasks(req, res, next) {
  try {
    const tasks = await taskService.getAllTasks(req.query);
    res.json(tasks);
  } catch (err) {
    console.log("Error getAllTasks ________________:", err);
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const newTask = await taskService.createTask(req.body);
    res.status(201).json(newTask);
  } catch (err) {
    console.log("Error createTask ________________:", err);
    next(err);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await taskService.getTaskById(req.params.taskId);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const updated = await taskService.updateTask(req.params.taskId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    await taskService.deleteTask(req.params.taskId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function updateDeadline(req, res, next) {
  try {
    const updated = await taskService.updateDeadline(req.params.taskId, req.body.deadline);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const updated = await taskService.updateStatus(req.params.taskId, req.body.status);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function startTask(req, res, next) {
  try {
    const started = await taskService.startTask(req.params.taskId);
    res.json(started);
  } catch (err) {
    next(err);
  }
}

async function pauseTask(req, res, next) {
  try {
    const paused = await taskService.pauseTask(req.params.taskId);
    res.json(paused);
  } catch (err) {
    next(err);
  }
}

async function duplicateTask(req, res, next) {
  try {
    const dup = await taskService.duplicateTask(req.params.taskId);
    res.status(201).json(dup);
  } catch (err) {
    next(err);
  }
}

async function archiveTask(req, res, next) {
  try {
    const archived = await taskService.archiveTask(req.params.taskId);
    res.json(archived);
  } catch (err) {
    next(err);
  }
}

async function messageContractor(req, res, next) {
  try {
    const message = await taskService.messageContractor(req.params.taskId, req.params.contractorId, req.body);
    res.json(message);
  } catch (err) {
    next(err);
  }
}

async function reassignTask(req, res, next) {
  try {
    const reassigned = await taskService.reassignTask(req.params.taskId, req.body.newAssigneeId);
    res.json(reassigned);
  } catch (err) {
    next(err);
  }
}

async function searchCandidates(req, res, next) {
  try {
    const candidates = await taskService.searchCandidates(req.params.taskId, req.query);
    res.json(candidates);
  } catch (err) {
    next(err);
  }
}

async function approveWork(req, res, next) {
  try {
    const result = await taskService.approveWork(req.params.taskId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function requestChanges(req, res, next) {
  try {
    const result = await taskService.requestChanges(req.params.taskId, req.body.comments);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function addFeedback(req, res, next) {
  try {
    const feedback = await taskService.addFeedback(req.params.taskId, req.body.feedback);
    res.json(feedback);
  } catch (err) {
    next(err);
  }
}

async function closeTask(req, res, next) {
  try {
    const closed = await taskService.closeTask(req.params.taskId);
    res.json(closed);
  } catch (err) {
    next(err);
  }
}

async function getActivityLog(req, res, next) {
  try {
    const log = await taskService.getActivityLog(req.params.taskId);
    res.json(log);
  } catch (err) {
    next(err);
  }
}

async function getProgress(req, res, next) {
  try {
    const progress = await taskService.getProgress(req.params.taskId);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

async function exportSummary(req, res, next) {
  try {
    const report = await taskService.exportSummary(req.params.taskId);
    res.attachment(`task-${req.params.taskId}-report.pdf`);
    res.send(report);
  } catch (err) {
    next(err);
  }
}

async function uploadAttachment(req, res, next) {
  try {
    const file = await taskService.uploadAttachment(req.params.taskId, req.file);
    res.status(201).json(file);
  } catch (err) {
    next(err);
  }
}

async function getAttachments(req, res, next) {
  try {
    const files = await taskService.getAttachments(req.params.taskId);
    res.json(files);
  } catch (err) {
    next(err);
  }
}

async function followTask(req, res, next) {
  try {
    const follow = await taskService.followTask(req.params.taskId, req.body.userId);
    res.json(follow);
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const comment = await taskService.addComment(req.params.taskId, req.body);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

async function getComments(req, res, next) {
  try {
    const comments = await taskService.getComments(req.params.taskId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
}

// Експорт списком у потрібному порядку
const controller = {
  getComments,
  addComment,
  followTask,
  getAttachments,
  uploadAttachment,
  exportSummary,
  getActivityLog,
  closeTask,
  addFeedback,
  requestChanges,
  approveWork,
  searchCandidates,
  reassignTask,
  messageContractor,
  archiveTask,
  duplicateTask,
  pauseTask,
  startTask,
  updateStatus,
  updateDeadline,
  deleteTask,
  updateTask,
  getTaskById,
  createTask,
  getAllTasks,
};

module.exports = controller;
