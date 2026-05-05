const express = require('express');
const router = express.Router();
const { stripeWebhook, getPOSTransactions, getPOSSummary } = require('../controllers/posController');
const authMiddleware = require('../middleware/authMiddleware');

// Stripe webhook — raw body required, NO auth middleware
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Protected routes
router.use(authMiddleware);
router.get('/transactions', getPOSTransactions);
router.get('/summary', getPOSSummary);

module.exports = router;