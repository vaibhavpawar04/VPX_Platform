const express = require('express');
const router = express.Router();
const {
  connectWallet,
  getBalances,
  deposit,
  withdraw,
  swap,
  getTransactions,
} = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');
const { generateDepositAddress, monitorAddress } = require('../services/alchemyService');
const { generateSolanaDepositAddress, monitorSolanaAddress } = require('../services/solanaService');
const PaymentPreference = require('../models/PaymentPreference');

router.use(authMiddleware);

router.post('/connect', connectWallet);

router.get('/connected', async (req, res) => {
  try {
    const wallet = await require('../models/Wallet').findOne({ userId: req.userId, isActive: true });
    res.json({ success: true, data: wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/balances', getBalances);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/swap', swap);
router.get('/transactions', getTransactions);

router.get('/deposit-address/:coin', async (req, res) => {
  try {
    const { coin } = req.params;
    const userId = req.userId;
    if (coin.toUpperCase() === 'ETH') {
      const address = await generateDepositAddress(userId);
      monitorAddress(address.toLowerCase(), userId);
      res.json({ success: true, address, network: 'Sepolia Testnet', coin: 'ETH' });
    } else if (coin.toUpperCase() === 'ARB') {
      const { generateArbitrumDepositAddress } = require('../services/arbitrumService');
      const address = await generateArbitrumDepositAddress(userId);
      res.json({ success: true, address, network: 'Arbitrum Sepolia Testnet', coin: 'ARB' });
    } else if (coin.toUpperCase() === 'BASE') {
      const { generateBaseDepositAddress, monitorBaseAddress } = require('../services/baseService');
      const address = await generateBaseDepositAddress(userId);
      res.json({ success: true, address, network: 'Base Sepolia Testnet', coin: 'BASE' });
    } else if (coin.toUpperCase() === 'SOL') {
      const address = await generateSolanaDepositAddress(userId);
      monitorSolanaAddress(address, userId);
      res.json({ success: true, address, network: 'Solana Devnet', coin: 'SOL' });
    } else {
      res.json({ success: true, address: 'Coming soon', network: 'mainnet', coin: coin.toUpperCase() });
    }
  } catch (err) {
    console.log('Get deposit address error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get("/payment-preferences", async (req, res) => {
  try {
    const userId = req.userId;
    const ALL_SUPPORTED_COINS = ["BTC", "ETH", "SOL", "BASE", "ARB", "BNB", "USDT", "XRP", "ADA", "DOGE"];
    let prefs = await PaymentPreference.findOne({ userId });
    if (!prefs) {
      prefs = await PaymentPreference.create({ userId });
    }
    const missingCoins = ALL_SUPPORTED_COINS.filter(c => !prefs.priorityOrder.includes(c));
    if (missingCoins.length > 0) {
      prefs.priorityOrder = [...prefs.priorityOrder, ...missingCoins];
      await prefs.save();
    }
    res.json({ success: true, data: prefs });
  } catch (err) {
    console.log("Get payment preferences error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post('/payment-preferences', async (req, res) => {
  try {
    const userId = req.userId;
    const { priorityOrder, excludedCoins } = req.body;
    const prefs = await PaymentPreference.findOneAndUpdate(
      { userId },
      { priorityOrder, excludedCoins, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: prefs, message: 'Payment preferences saved!' });
  } catch (err) {
    console.log('Save payment preferences error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;