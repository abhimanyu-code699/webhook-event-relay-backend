const express = require('express');
const { receiveEvent, getAllEvents } = require('../controllers/eventController');

const router = express.Router();

router.post('/events/receive',receiveEvent);
router.get('/events',getAllEvents);

module.exports = router;