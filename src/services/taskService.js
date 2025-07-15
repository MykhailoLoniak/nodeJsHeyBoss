const { Task } = require('../models/task');
// const Comment = require('../models/commentModel');
const { Attachment } = require('../models/attachment');
const { ActivityLog } = require('../models/activityLog');
// const Contractor = require('../models/contractorModel');

async function getAllTasks(query) {
  const { page = 1, limit = 20, status, assignee } = query;
  const where = {};
  if (status) where.status = status;
  if (assignee) where.assignee = assignee;

  const tasks = await Task.findAll({
    where,
    offset: (page - 1) * parseInt(limit, 10),
    limit: parseInt(limit, 10),
    order: [['created_at', 'DESC']],
  });

  return tasks;
}

// async function createTask(data) {
//   const task = await Task.create(data);
//   await ActivityLog.create({ task_id: task.id, action: 'created', data });
//   return task;
// }

async function getTaskById(taskId) {
  const task = await Task.findById(taskId).populate('assignee').lean();
  if (!task) throw new Error('Task not found');
  return task;
}

async function updateTask(taskId, updates) {
  const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });
  await ActivityLog.create({ task: taskId, action: 'updated', data: updates });
  return task;
}

async function deleteTask(taskId) {
  await Task.findByIdAndDelete(taskId);
  await ActivityLog.create({ task: taskId, action: 'deleted' });
}

async function updateDeadline(taskId, deadline) {
  const task = await Task.findByIdAndUpdate(taskId, { deadline }, { new: true });
  await ActivityLog.create({ task: taskId, action: 'deadline_changed', data: { deadline } });
  return task;
}

async function updateStatus(taskId, status) {
  const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
  await ActivityLog.create({ task: taskId, action: 'status_changed', data: { status } });
  return task;
}

async function startTask(taskId) {
  const startTime = new Date();
  const task = await Task.findByIdAndUpdate(
    taskId,
    { status: 'In Progress', $push: { timers: { start: startTime } } },
    { new: true }
  );
  await ActivityLog.create({ task: taskId, action: 'started', data: { startTime } });
  return task;
}

async function pauseTask(taskId) {
  const pauseTime = new Date();
  const task = await Task.findById(taskId);
  const lastTimer = task.timers[task.timers.length - 1];
  lastTimer.end = pauseTime;
  await task.save();
  await ActivityLog.create({ task: taskId, action: 'paused', data: { pauseTime } });
  return task;
}

async function duplicateTask(taskId) {
  const orig = await Task.findById(taskId).lean();
  const { _id, createdAt, updatedAt, ...data } = orig;
  const copy = await Task.create({ ...data, title: data.title + ' (копія)' });
  await ActivityLog.create({ task: copy._id, action: 'duplicated', data: { from: taskId } });
  return copy;
}

async function archiveTask(taskId) {
  const task = await Task.findByIdAndUpdate(taskId, { archived: true }, { new: true });
  await ActivityLog.create({ task: taskId, action: 'archived' });
  return task;
}

async function messageContractor(taskId, contractorId, messageData) {
  // TODO: інтеграція з поштовим/чат-сервісом
  await ActivityLog.create({ task: taskId, action: 'message_sent', data: { contractorId, messageData } });
  return { contractorId, ...messageData, sentAt: new Date() };
}

async function reassignTask(taskId, newAssigneeId) {
  const task = await Task.findByIdAndUpdate(taskId, { assignee: newAssigneeId }, { new: true });
  await ActivityLog.create({ task: taskId, action: 'reassigned', data: { newAssigneeId } });
  return task;
}

async function searchCandidates(taskId, filters) {
  return Contractor.find(filters).limit(20).lean();
}

async function approveWork(taskId) {
  const task = await Task.findByIdAndUpdate(taskId, { status: 'Approved' }, { new: true });
  await ActivityLog.create({ task: taskId, action: 'approved' });
  return task;
}

async function requestChanges(taskId, comments) {
  await ActivityLog.create({ task: taskId, action: 'changes_requested', data: { comments } });
  return { taskId, comments };
}

async function addFeedback(taskId, feedback) {
  await ActivityLog.create({ task: taskId, action: 'feedback_added', data: { feedback } });
  return { taskId, feedback };
}

async function closeTask(taskId) {
  const task = await Task.findByIdAndUpdate(taskId, { status: 'Closed' }, { new: true });
  await ActivityLog.create({ task: taskId, action: 'closed' });
  return task;
}

async function getActivityLog(taskId) {
  return ActivityLog.find({ task: taskId }).sort({ createdAt: 1 }).lean();
}

async function getProgress(taskId) {
  const task = await Task.findById(taskId).lean();
  return { completedSubtasks: task.subtasks.filter(s => s.done).length, totalSubtasks: task.subtasks.length };
}

async function exportSummary(taskId) {
  // TODO: генерація PDF- чи Excel-звіту
  return Buffer.from(`Report for task ${taskId}`);
}

async function uploadAttachment(taskId, file) {
  const doc = await Attachment.create({ task: taskId, filename: file.originalname, path: file.path });
  await ActivityLog.create({ task: taskId, action: 'file_attached', data: { filename: file.originalname } });
  return doc;
}

async function getAttachments(taskId) {
  return Attachment.find({ task: taskId }).lean();
}

async function followTask(taskId, userId) {
  const task = await Task.findById(taskId);
  task.followers = task.followers || [];
  if (!task.followers.includes(userId)) task.followers.push(userId);
  await task.save();
  await ActivityLog.create({ task: taskId, action: 'followed', data: { userId } });
  return { taskId, userId };
}

async function addComment(taskId, data) {
  const comment = await Comment.create({ task: taskId, ...data });
  await ActivityLog.create({ task: taskId, action: 'comment_added', data: { commentId: comment._id } });
  return comment;
}

async function getComments(taskId) {
  return Comment.find({ task: taskId }).sort({ createdAt: 1 }).lean();
}

// Експорт списком 
const taskService = {
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
  // createTask,
  getAllTasks,
};

module.exports = taskService;
