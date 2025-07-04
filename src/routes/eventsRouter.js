const express = require('express');
const router = express.Router();
const events = require('../controllers/eventsController');
const { catchError } = require('../utils/catchError');

router.get('/', catchError(events.getEvents));
router.get('/:id', catchError(events.getEventById));
router.post('/', catchError(events.createEvent));
router.put('/:id', catchError(events.updateEvent));
router.delete('/:id', catchError(events.deleteEvent));

router.post('/:id/share', catchError(events.shareEvent));
router.get('/:id/share', catchError(events.getEventShares));

module.exports = router;
