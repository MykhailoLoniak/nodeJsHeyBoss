jest.mock('../services/jwtService', () => ({
  jwtService: {
    verifyRefresh: jest.fn()
  }
}));
const { jwtService } = require('../services/jwtService');

// tests/eventsController.test.js
const httpMocks = require('node-mocks-http');
const { Op } = require('sequelize');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  shareEvent,
  getEventShares
} = require('../controllers/eventsController');
const { Event, EventShares, User } = require('../models');

const { ApiError } = require('../exceptions/api.error');

jest.mock('../models');

describe('eventsController', () => {
  beforeEach(() => jest.clearAllMocks());

  // допоміжна функція для мокання авторизації
  const mockAuth = user => jwtService.verifyRefresh.mockResolvedValue(user);

  //
  // 1. GET /api/auth/events
  //
  describe('getEvents', () => {
    it('401 якщо токен невалідний', async () => {
      mockAuth(null);
      const req = httpMocks.createRequest({ cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse();
      const next = jest.fn();
      await getEvents(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(401);
    });

    it('помилка DB при пошуку шарингів → next(err)', async () => {
      mockAuth({ id: 1 });
      EventShares.findAll.mockRejectedValue(new Error('share error'));
      const req = httpMocks.createRequest({ cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse();
      const next = jest.fn();
      await getEvents(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('помилка DB при Event.findAll → next(err)', async () => {
      mockAuth({ id: 2 });
      EventShares.findAll.mockResolvedValue([]);
      Event.findAll.mockRejectedValue(new Error('event error'));
      const req = httpMocks.createRequest({ cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse();
      const next = jest.fn();
      await getEvents(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('пустий масив якщо немає подій', async () => {
      mockAuth({ id: 3 });
      EventShares.findAll.mockResolvedValue([]);
      Event.findAll.mockResolvedValue([]);
      const req = httpMocks.createRequest({ cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse();
      await getEvents(req, res, () => { });
      expect(res._getJSONData()).toEqual([]);
    });

    it('керівник (organizer) бачить свої події', async () => {
      mockAuth({ id: 4 });
      EventShares.findAll.mockResolvedValue([]);
      Event.findAll.mockResolvedValue([{ id: 10, user_id: 4 }]);
      const req = httpMocks.createRequest({ cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse();
      await getEvents(req, res, () => { });
      expect(res._getJSONData()).toEqual([{ id: 10, user_id: 4 }]);
    });

    it('shared-only: бачить лише розшарені', async () => {
      mockAuth({ id: 5 });
      EventShares.findAll.mockResolvedValue([{ event_id: 20 }]);
      Event.findAll.mockResolvedValue([{ id: 20, user_id: 9 }]);
      const req = httpMocks.createRequest({ cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse();
      await getEvents(req, res, () => { });
      expect(res._getJSONData()).toEqual([{ id: 20, user_id: 9 }]);
    });

    it('фільтр ?date=', async () => {
      mockAuth({ id: 6 });
      EventShares.findAll.mockResolvedValue([]);
      Event.findAll.mockResolvedValue([]);
      const req = httpMocks.createRequest({
        cookies: { refresh_token: 'x' },
        query: { date: '2025-07-10' }
      });
      const res = httpMocks.createResponse();
      await getEvents(req, res, () => { });
      expect(Event.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          start: expect.objectContaining({ [Op.gte]: expect.any(Date) })
        })
      }));
    });

    it('фільтр ?start=&end=', async () => {
      mockAuth({ id: 7 });
      EventShares.findAll.mockResolvedValue([]);
      Event.findAll.mockResolvedValue([]);
      const req = httpMocks.createRequest({
        cookies: { refresh_token: 'x' },
        query: { start: '2025-07-01', end: '2025-07-31' }
      });
      const res = httpMocks.createResponse();
      await getEvents(req, res, () => { });
      expect(Event.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          start: { [Op.between]: [new Date('2025-07-01'), new Date('2025-07-31')] }
        })
      }));
    });
  });

  //
  // 2. GET /api/auth/events/:id
  //
  describe('getEventById', () => {
    it('401 якщо токен невалідний', async () => {
      mockAuth(null);
      const req = httpMocks.createRequest({ params: { id: '1' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await getEventById(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('404 якщо подію не знайдено', async () => {
      mockAuth({ id: 2 });
      Event.findByPk.mockResolvedValue(null);
      const req = httpMocks.createRequest({ params: { id: '2' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await getEventById(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(404);
    });

    it('403 якщо немає доступу', async () => {
      mockAuth({ id: 3 });
      Event.findByPk.mockResolvedValue({ id: 3, user_id: 9 });
      EventShares.findOne.mockResolvedValue(null);
      const req = httpMocks.createRequest({ params: { id: '3' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await getEventById(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(403);
    });

    it('успіх для організатора', async () => {
      mockAuth({ id: 4 });
      Event.findByPk.mockResolvedValue({ id: 4, user_id: 4 });
      const req = httpMocks.createRequest({ params: { id: '4' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse();
      await getEventById(req, res, () => { });
      expect(res._getData()).toContain('"id":4');
    });

    it('успіх для shared-користувача', async () => {
      mockAuth({ id: 5 });
      Event.findByPk.mockResolvedValue({ id: 5, user_id: 9 });
      EventShares.findOne.mockResolvedValue({ event_id: 5, user_id: 5 });
      const req = httpMocks.createRequest({ params: { id: '5' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse();
      await getEventById(req, res, () => { });
      expect(res._getData()).toContain('"id":5');
    });
  });

  //
  // 3. POST /api/auth/events
  //
  describe('createEvent', () => {
    it('401 якщо токен невалідний', async () => {
      mockAuth(null);
      const req = httpMocks.createRequest({
        body: { title: 'T', start: '2025-07-01', end: '2025-07-02' },
        cookies: { refresh_token: 'x' }
      });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await createEvent(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('400 якщо відсутні поля', async () => {
      mockAuth({ id: 1 });
      const req = httpMocks.createRequest({
        body: { title: 'T' },
        cookies: { refresh_token: 'x' }
      });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await createEvent(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(400);
    });

    it('помилка DB при створенні', async () => {
      mockAuth({ id: 2 });
      Event.create.mockRejectedValue(new Error('create error'));
      const req = httpMocks.createRequest({
        body: { title: 'T', start: '2025-07-01', end: '2025-07-02' },
        cookies: { refresh_token: 'x' }
      });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await createEvent(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('успішне створення', async () => {
      mockAuth({ id: 3 });
      Event.create.mockResolvedValue({ id: 9, title: 'OK', user_id: 3 });
      const req = httpMocks.createRequest({
        body: { title: 'OK', start: '2025-07-01', end: '2025-07-02' },
        cookies: { refresh_token: 'x' }
      });
      const res = httpMocks.createResponse();
      await createEvent(req, res, () => { });
      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual({ id: 9, title: 'OK', user_id: 3 });
    });
  });

  //
  // 4. PUT /api/auth/events/:id
  //
  describe('updateEvent', () => {
    it('401 якщо токен невалідний', async () => {
      mockAuth(null);
      const req = httpMocks.createRequest({ params: { id: '1' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await updateEvent(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });
    it('404 якщо відсутня подія', async () => {
      mockAuth({ id: 1 });
      Event.findByPk.mockResolvedValue(null);
      const req = httpMocks.createRequest({ params: { id: '1' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await updateEvent(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(404);
    });
    it('403 якщо не організатор', async () => {
      mockAuth({ id: 2 });
      Event.findByPk.mockResolvedValue({ id: 1, user_id: 9 });
      const req = httpMocks.createRequest({ params: { id: '1' }, cookies: { refresh_token: 'x' }, body: { title: 'X' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await updateEvent(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(403);
    });
    it('помилка DB при оновленні', async () => {
      mockAuth({ id: 3 });
      Event.findByPk.mockResolvedValue({ id: 1, user_id: 3 });
      Event.update.mockRejectedValue(new Error('update error'));
      const req = httpMocks.createRequest({ params: { id: '1' }, cookies: { refresh_token: 'x' }, body: { title: 'X' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await updateEvent(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    it('успішне оновлення', async () => {
      mockAuth({ id: 4 });
      Event.findByPk.mockResolvedValue({ id: 5, user_id: 4 });
      Event.update.mockResolvedValue([1]);
      Event.findByPk.mockResolvedValue({ id: 5, title: 'Upd' });
      const req = httpMocks.createRequest({ params: { id: '5' }, cookies: { refresh_token: 'x' }, body: { title: 'Upd' } });
      const res = httpMocks.createResponse();
      await updateEvent(req, res, () => { });
      expect(res._getJSONData()).toEqual({ id: 5, title: 'Upd' });
    });
  });

  //
  // 5. DELETE /api/auth/events/:id
  //
  describe('deleteEvent', () => {
    it('401 якщо токен невалідний', async () => {
      mockAuth(null);
      const req = httpMocks.createRequest({ params: { id: '1' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await deleteEvent(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });
    it('404 якщо відсутня подія', async () => {
      mockAuth({ id: 1 });
      Event.findByPk.mockResolvedValue(null);
      const req = httpMocks.createRequest({ params: { id: '1' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await deleteEvent(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(404);
    });
    it('403 якщо не організатор', async () => {
      mockAuth({ id: 2 });
      Event.findByPk.mockResolvedValue({ id: 1, user_id: 9 });
      const req = httpMocks.createRequest({ params: { id: '1' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await deleteEvent(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(403);
    });
    it('помилка DB при delete', async () => {
      mockAuth({ id: 3 });
      Event.findByPk.mockResolvedValue({ id: 1, user_id: 3 });
      Event.destroy.mockRejectedValue(new Error('destroy error'));
      const req = httpMocks.createRequest({ params: { id: '1' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await deleteEvent(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    it('успішне видалення', async () => {
      mockAuth({ id: 4 });
      Event.findByPk.mockResolvedValue({ id: 2, user_id: 4 });
      Event.destroy.mockResolvedValue(1);
      const req = httpMocks.createRequest({ params: { id: '2' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse();
      await deleteEvent(req, res, () => { });
      expect(res._getJSONData()).toEqual({ message: 'Event deleted' });
    });
  });

  //
  // 6. POST /api/auth/events/:id/share
  //
  describe('shareEvent', () => {
    it('401 якщо токен невалідний', async () => {
      mockAuth(null);
      const req = httpMocks.createRequest({ params: { id: '1' }, body: { user_ids: [1] }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await shareEvent(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });
    it('404 якщо подію не знайдено', async () => {
      mockAuth({ id: 5 });
      Event.findByPk.mockResolvedValue(null);
      const req = httpMocks.createRequest({ params: { id: '1' }, body: { user_ids: [1] }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await shareEvent(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(404);
    });
    it('403 якщо не організатор', async () => {
      mockAuth({ id: 6 });
      Event.findByPk.mockResolvedValue({ id: 1, user_id: 9 });
      const req = httpMocks.createRequest({ params: { id: '1' }, body: { user_ids: [1] }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await shareEvent(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(403);
    });
    it('400 якщо user_ids не валідні', async () => {
      mockAuth({ id: 7 });
      Event.findByPk.mockResolvedValue({ id: 2, user_id: 7 });
      const req = httpMocks.createRequest({ params: { id: '2' }, body: {}, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await shareEvent(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(400);
    });
    it('DB error on destroy', async () => {
      mockAuth({ id: 8 });
      Event.findByPk.mockResolvedValue({ id: 3, user_id: 8 });
      EventShares.destroy.mockRejectedValue(new Error('destroy err'));
      const req = httpMocks.createRequest({ params: { id: '3' }, body: { user_ids: [1] }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await shareEvent(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    it('успішний шаринг', async () => {
      mockAuth({ id: 9 });
      Event.findByPk.mockResolvedValue({ id: 4, user_id: 9 });
      EventShares.destroy.mockResolvedValue(1);
      EventShares.bulkCreate.mockResolvedValue([{}]);
      const req = httpMocks.createRequest({ params: { id: '4' }, body: { user_ids: [1] }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse();
      await shareEvent(req, res, () => { });
      expect(res._getJSONData()).toEqual({ message: 'Event shared successfully', shared_with: { user_ids: [1] } });
    });
  });

  //
  // 7. GET /api/auth/events/:id/share
  //
  describe('getEventShares', () => {
    it('401 якщо токен невалідний', async () => {
      mockAuth(null);
      const req = httpMocks.createRequest({ params: { id: '1' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await getEventShares(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });
    it('404 якщо подію не знайдено', async () => {
      mockAuth({ id: 10 });
      Event.findByPk.mockResolvedValue(null);
      const req = httpMocks.createRequest({ params: { id: '1' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await getEventShares(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(404);
    });
    it('403 якщо не організатор', async () => {
      mockAuth({ id: 11 });
      Event.findByPk.mockResolvedValue({ id: 5, user_id: 9 });
      const req = httpMocks.createRequest({ params: { id: '5' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await getEventShares(req, res, next);
      expect(next.mock.calls[0][0].status).toBe(403);
    });
    it('DB error on share find', async () => {
      mockAuth({ id: 12 });
      Event.findByPk.mockResolvedValue({ id: 6, user_id: 12 });
      EventShares.findAll.mockRejectedValue(new Error('find err'));
      const req = httpMocks.createRequest({ params: { id: '6' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse(); const next = jest.fn();
      await getEventShares(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    it('успішний get shares', async () => {
      mockAuth({ id: 13 });
      Event.findByPk.mockResolvedValue({ id: 7, user_id: 13 });
      EventShares.findAll.mockResolvedValue([{ user_id: 2 }]);
      User.findAll.mockResolvedValue([{ id: 2, first_name: 'A', last_name: 'B', email: 'a@b' }]);
      const req = httpMocks.createRequest({ params: { id: '7' }, cookies: { refresh_token: 'x' } });
      const res = httpMocks.createResponse();
      await getEventShares(req, res, () => { });
      const json = res._getJSONData();
      expect(json).toEqual({
        event_id: 7,
        shared_with: { user_ids: [2] },
        users: [{ id: 2, first_name: 'A', last_name: 'B', email: 'a@b' }]
      });
    });
  });
});
