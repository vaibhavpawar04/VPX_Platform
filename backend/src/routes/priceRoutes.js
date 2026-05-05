const express = require('express');
const router = express.Router();
const { getLatestPrices } = require('../services/binanceService');

// GET /api/prices - returns latest prices
router.get('/', (req, res) => {
  const prices = getLatestPrices();
  res.json({ success: true, data: prices });
});

module.exports = router;