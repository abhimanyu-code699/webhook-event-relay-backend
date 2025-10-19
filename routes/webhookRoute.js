const express = require('express');
const { registerWebhook } = require('../controllers/webhookController');

const router = express.Router();

router.post('/register/webhook',registerWebhook);

module.exports = router;