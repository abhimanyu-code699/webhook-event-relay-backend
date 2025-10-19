const express = require('express');
const { receiveEvent } = require('../controllers/eventController');

const router = express.Router();

router.post('/events',receiveEvent);

module.exports = router;