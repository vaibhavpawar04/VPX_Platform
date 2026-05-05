const express = require('express');
const router = express.Router();
const { getLatestNews } = require('../services/newsService');

// GET /api/news - returns latest crypto news
router.get('/', (req, res) => {
  const news = getLatestNews();
  res.json({ success: true, data: news });
});

module.exports = router;