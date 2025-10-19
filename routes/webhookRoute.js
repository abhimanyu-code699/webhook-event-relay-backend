const express = require('express');
const { registerWebhook, listWebhooks } = require('../controllers/webhookController');

const router = express.Router();

router.post('/webhooks/register',registerWebhook);
router.get('/webhooks/listen',listWebhooks);

module.exports = router;