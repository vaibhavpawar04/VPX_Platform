const express = require('express');
const router = express.Router();
const { getHoldings, getSummary, getTrades, getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/portfolioController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/holdings',  getHoldings);
router.get('/summary',   getSummary);
router.get('/trades',    getTrades);
router.get('/watchlist', getWatchlist);
router.post('/watchlist/add', addToWatchlist);
router.post('/watchlist/remove', removeFromWatchlist);

module.exports = router;
