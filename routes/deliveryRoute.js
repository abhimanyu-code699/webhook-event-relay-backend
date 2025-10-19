const express = require('express');
const router = express.Router();
const { getDeliveries } = require('../controllers/deliveryController');

router.get('/', getDeliveries);

module.exports = router;
