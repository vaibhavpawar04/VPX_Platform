const express = require('express');
const router = express.Router();
const { getHoldings, getSummary, getTrades, getWatchlist } = require('../controllers/portfolioController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/holdings',  getHoldings);
router.get('/summary',   getSummary);
router.get('/trades',    getTrades);
router.get('/watchlist', getWatchlist);

module.exports = router;