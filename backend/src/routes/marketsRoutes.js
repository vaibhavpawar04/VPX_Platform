const express = require('express');
const router = express.Router();
const { getMarkets } = require('../services/marketsService');

// GET /api/markets - returns all markets data
router.get('/', (req, res) => {
  const markets = getMarkets();
  res.json({ success: true, data: markets });
});

// GET /api/markets/:category - returns markets by category
router.get('/:category', (req, res) => {
  const { category } = req.params;
  const markets = getMarkets();

  if (category === 'all') {
    return res.json({ success: true, data: markets });
  }

  if (category === 'gainers') {
    const gainers = markets.filter(m => m.change24h > 0).sort((a, b) => b.change24h - a.change24h).slice(0, 20);
    return res.json({ success: true, data: gainers });
  }

  if (category === 'losers') {
    const losers = markets.filter(m => m.change24h < 0).sort((a, b) => a.change24h - b.change24h).slice(0, 20);
    return res.json({ success: true, data: losers });
  }

  const filtered = markets.filter(m => m.category === category);
  res.json({ success: true, data: filtered });
});

module.exports = router;