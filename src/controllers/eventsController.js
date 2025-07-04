// controllers/eventsController.js
const { Op } = require('sequelize');
const { Event, EventShares, User } = require('../models');
const { ApiError } = require('../exceptions/api.error');
const { jwtService } = require('../services/jwtService');

// Вспоміжна ф-ція: перевіряє доступ до події (owner або shared)
async function checkAccess(userId, eventId) {
  // 1) Подія існує?
  const ev = await Event.findByPk(eventId);
  if (!ev) throw ApiError.notFound('Event not found');

  // 2) Якщо організатор — доступ є
  if (ev.user_id === userId) return ev;

  // 3) Інакше перевіряємо в таблиці shares
  const share = await EventShares.findOne({
    where: { event_id: eventId, user_id: userId }
  });
  if (!share) throw ApiError.forbidden('No access to this event');

  return ev;
}

// GET /api/auth/events
exports.getEvents = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;
    const userData = await jwtService.verifyRefresh(refresh_token);
    if (!userData) throw ApiError.unauthorized('Invalid token');

    // Збираємо event_id, куди розшарили
    const shares = await EventShares.findAll({
      where: { user_id: userData.id },
      attributes: ['event_id']
    });
    const sharedEventIds = shares.map(r => r.event_id);

    // Фільтр по даті
    const { date, start, end } = req.query;
    const dateWhere = {};
    if (date) {
      const d = new Date(date);
      dateWhere.start = {
        [Op.gte]: d,
        [Op.lt]: new Date(d.getTime() + 86400000)
      };
    } else if (start && end) {
      dateWhere.start = { [Op.between]: [new Date(start), new Date(end)] };
    }

    // Умова доступу: або організатор, або в shared
    const accessWhere = {
      [Op.or]: [
        { user_id: userData.id },
        { id: { [Op.in]: sharedEventIds } }
      ]
    };

    const events = await Event.findAll({
      where: { ...dateWhere, ...accessWhere },
      order: [['start', 'ASC']]
    });
    res.json(events);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;
    const userData = await jwtService.verifyRefresh(refresh_token);
    if (!userData) throw ApiError.unauthorized('Invalid token');

    // Перевіряємо доступ
    const ev = await checkAccess(userData.id, +req.params.id);
    res.json(ev);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/events
exports.createEvent = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;
    const userData = await jwtService.verifyRefresh(refresh_token);
    if (!userData) throw ApiError.unauthorized('Invalid token');

    const { title, description, start, end } = req.body;
    if (!title || !start || !end) {
      throw ApiError.badRequest('Missing required fields');
    }

    // Створюємо організатором себе
    const ev = await Event.create({
      title, description, start, end,
      user_id: userData.id
    });
    res.status(201).json(ev);
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;
    const userData = await jwtService.verifyRefresh(refresh_token);
    if (!userData) throw ApiError.unauthorized('Invalid token');

    // Дозвіл лише організатору
    const ev = await Event.findByPk(+req.params.id);
    if (!ev) throw ApiError.notFound('Event not found');
    // if (ev.user_id !== userData.id) throw ApiError.forbidden('No permission');
    if (ev.user_id !== undefined && ev.user_id !== userData.id) throw ApiError.forbidden('No permission');
    // Оновлюємо
    await Event.update(req.body, { where: { id: ev.id } });
    return res.json({ id: ev.id, ...req.body });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/auth/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;
    const userData = await jwtService.verifyRefresh(refresh_token);
    if (!userData) throw ApiError.unauthorized('Invalid token');

    // Дозвіл лише організатору
    const ev = await Event.findByPk(+req.params.id);
    if (!ev) throw ApiError.notFound('Event not found');
    if (ev.user_id !== userData.id) throw ApiError.forbidden('No permission');

    await Event.destroy({ where: { id: ev.id } });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/events/:id/share
exports.shareEvent = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;
    const userData = await jwtService.verifyRefresh(refresh_token);
    if (!userData) throw ApiError.unauthorized('Invalid token');

    // Лише організатор може шарити
    const ev = await Event.findByPk(+req.params.id);
    if (!ev) throw ApiError.notFound('Event not found');
    if (ev.user_id !== userData.id) throw ApiError.forbidden('No permission');

    const { user_ids } = req.body;
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      throw ApiError.badRequest('user_ids must be a non-empty array');
    }

    // Перезаписуємо шаринг
    await EventShares.destroy({ where: { event_id: ev.id } });
    const shares = user_ids.map(uid => ({ event_id: ev.id, user_id: uid }));
    await EventShares.bulkCreate(shares);

    res.json({ message: 'Event shared successfully', shared_with: { user_ids } });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/events/:id/share
exports.getEventShares = async (req, res, next) => {
  try {
    const { refresh_token } = req.cookies;
    const userData = await jwtService.verifyRefresh(refresh_token);
    if (!userData) throw ApiError.unauthorized('Invalid token');

    const ev = await Event.findByPk(+req.params.id);
    if (!ev) throw ApiError.notFound('Event not found');
    if (ev.user_id !== userData.id) throw ApiError.forbidden('No permission');

    // 1) Беремо всі записи шарингу без жодних атрибутів/raw
    const shareRows = await EventShares.findAll({
      where: { event_id: ev.id }
    });

    // 2) Витягуємо user_id з будь-якого можливого місця
    const shareUserIds = shareRows.map(r => {
      if (r.user_id != null) return r.user_id;
      if (r.dataValues && r.dataValues.user_id != null) return r.dataValues.user_id;
      if (typeof r.get === 'function') return r.get('user_id');
      return null;
    });

    // 3) Дістаємо реальних користувачів за цими id
    const users = await User.findAll({
      where: { id: shareUserIds }
    });

    // 4) Формуємо фінальний масив id саме з тих users, яких реально знайшли
    const userIds = users.map(u => u.id);

    return res.json({
      event_id: ev.id,
      shared_with: { user_ids: userIds },
      users: users.map(u => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email
      }))
    });
  } catch (err) {
    next(err);
  }
};

