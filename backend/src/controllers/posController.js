const Balance = require('../models/Balance');
const Transaction = require('../models/Transaction');
const PaymentPreference = require('../models/PaymentPreference');
const https = require('https');

const getStripe = () => require('stripe')(process.env.STRIPE_SECRET_KEY);

const getUSDRate = (currency) => {
  return new Promise((resolve, reject) => {
    https.get('https://api.exchangerate-api.com/v4/latest/USD', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const rate = parsed.rates[currency.toUpperCase()];
          if (!rate) return reject(new Error(`Currency ${currency} not supported`));
          resolve(rate);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
};

const stripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const startTime = Date.now();

    try {
      const fiatAmount = paymentIntent.amount / 100;
      const fiatCurrency = paymentIntent.currency.toUpperCase();
      const userId = paymentIntent.metadata?.userId;

      console.log(`POS Payment received: ${fiatAmount} ${fiatCurrency} for user ${userId}`);

      if (!userId) {
        console.log('No userId in payment metadata — skipping');
        return res.json({ received: true });
      }

      // Convert fiat → USD
      let usdAmount;
      if (fiatCurrency === 'USD') {
        usdAmount = fiatAmount;
      } else {
        const rate = await getUSDRate(fiatCurrency);
        usdAmount = fiatAmount / rate;
      }
      console.log(`Converted ${fiatAmount} ${fiatCurrency} → $${usdAmount.toFixed(2)} USD`);

      // Get markets
      const { getMarkets } = require('../services/marketsService');
      const markets = getMarkets();

      // Get user balances
      const balances = await Balance.find({ userId, amount: { $gt: 0 } });

      if (!balances.length) {
        await Transaction.create({
          userId, type: 'pos_payment', fiatAmount, fiatCurrency,
          usdAmount, stripePaymentId: paymentIntent.id,
          breakdown: [], processingTimeMs: Date.now() - startTime,
          status: 'declined', note: 'No wallet balance',
        });
        console.log('POS Payment declined — no balance');
        return res.json({ received: true });
      }

      // Get payment preferences
      const prefs = await PaymentPreference.findOne({ userId });
      const excludedCoins = prefs?.excludedCoins || [];
      const priorityOrder = prefs?.priorityOrder || null;

      // Filter out excluded coins
      const availableBalances = balances.filter(b => !excludedCoins.includes(b.coin));

      if (!availableBalances.length) {
        await Transaction.create({
          userId, type: 'pos_payment', fiatAmount, fiatCurrency,
          usdAmount, stripePaymentId: paymentIntent.id,
          breakdown: [], processingTimeMs: Date.now() - startTime,
          status: 'declined', note: 'All coins excluded by user preferences',
        });
        console.log('POS Payment declined — all coins excluded');
        return res.json({ received: true });
      }

      // Calculate USD value per coin
      const coinValues = [];
      let totalWalletUSD = 0;

      for (const bal of availableBalances) {
        const market = markets.find(m => m.symbol === bal.coin);
        if (!market || !market.price) continue;
        const usdValue = bal.amount * market.price;
        coinValues.push({
          coin: bal.coin,
          amount: bal.amount,
          price: market.price,
          usdValue,
        });
        totalWalletUSD += usdValue;
      }

      console.log(`Total available wallet value: $${totalWalletUSD.toFixed(2)} USD`);

      // Check sufficient balance
      if (totalWalletUSD < usdAmount) {
        await Transaction.create({
          userId, type: 'pos_payment', fiatAmount, fiatCurrency,
          usdAmount, stripePaymentId: paymentIntent.id,
          breakdown: [], processingTimeMs: Date.now() - startTime,
          status: 'declined',
          note: `Insufficient balance. Required: $${usdAmount.toFixed(2)}, Available: $${totalWalletUSD.toFixed(2)}`,
        });
        console.log('POS Payment declined — insufficient balance');
        return res.json({ received: true });
      }

      // Sort coins by priority order or proportional
      let orderedCoins;

      if (priorityOrder && priorityOrder.length > 0) {
        // Priority order — drain coins in user's preferred order
        console.log(`Using priority order: ${priorityOrder.join(' → ')}`);
        orderedCoins = [...coinValues].sort((a, b) => {
          const aIndex = priorityOrder.indexOf(a.coin);
          const bIndex = priorityOrder.indexOf(b.coin);
          const aRank = aIndex === -1 ? 999 : aIndex;
          const bRank = bIndex === -1 ? 999 : bIndex;
          return aRank - bRank;
        });
      } else {
        // No preferences — fall back to proportional
        console.log('No preferences set — using proportional split');
        orderedCoins = null;
      }

      const breakdown = [];
      let remainingUSD = usdAmount;

      if (orderedCoins) {
        // PRIORITY ORDER — drain one coin at a time
        for (const coin of orderedCoins) {
          if (remainingUSD <= 0) break;

          const useUSD = Math.min(coin.usdValue, remainingUSD);
          const useCrypto = useUSD / coin.price;

          let txHash = null;
          let onChain = false;

          if (coin.coin === 'ETH') {
            try {
              console.log(`Swapping ${useCrypto.toFixed(8)} ETH → USDC on Uniswap Sepolia...`);
              const { swapETHToUSDC } = require('../services/uniswapService');
              const result = await swapETHToUSDC(userId, parseFloat(useCrypto.toFixed(8)));
              txHash = result.txHash;
              onChain = true;
              console.log(`✓ ETH swap txHash: ${txHash}`);
            } catch (err) {
              console.log(`ETH swap failed, MongoDB only: ${err.message}`);
            }
          } else if (coin.coin === 'SOL') {
            try {
              console.log(`Swapping ${useCrypto.toFixed(8)} SOL → devUSDC on Orca Devnet...`);
              const { swapSOLToUSDC } = require('../services/orcaService');
              const result = await swapSOLToUSDC(userId, parseFloat(useCrypto.toFixed(8)));
              txHash = result.txHash;
              onChain = true;
              console.log(`✓ SOL swap txHash: ${txHash}`);
            } catch (err) {
              console.log(`SOL swap failed, MongoDB only: ${err.message}`);
            }
          }

          breakdown.push({
            coin: coin.coin,
            cryptoAmount: useCrypto,
            usdValue: useUSD,
            txHash,
            onChain,
            explorer: txHash
              ? coin.coin === 'ETH'
                ? `https://sepolia.etherscan.io/tx/${txHash}`
                : `https://solscan.io/tx/${txHash}?cluster=devnet`
              : null,
          });

          await Balance.updateOne(
            { userId, coin: coin.coin },
            { $inc: { amount: -useCrypto }, $set: { updatedAt: new Date() } }
          );

          console.log(`Deducted ${useCrypto.toFixed(8)} ${coin.coin} ($${useUSD.toFixed(2)}) from user ${userId}`);
          remainingUSD -= useUSD;
        }

      } else {
        // PROPORTIONAL SPLIT fallback
        for (const coin of coinValues) {
          const weight = coin.usdValue / totalWalletUSD;
          const deductUSD = usdAmount * weight;
          const deductCrypto = deductUSD / coin.price;

          let txHash = null;
          let onChain = false;

          if (coin.coin === 'ETH') {
            try {
              const { swapETHToUSDC } = require('../services/uniswapService');
              const result = await swapETHToUSDC(userId, parseFloat(deductCrypto.toFixed(8)));
              txHash = result.txHash;
              onChain = true;
            } catch (err) {
              console.log(`ETH swap failed: ${err.message}`);
            }
          } else if (coin.coin === 'SOL') {
            try {
              const { swapSOLToUSDC } = require('../services/orcaService');
              const result = await swapSOLToUSDC(userId, parseFloat(deductCrypto.toFixed(8)));
              txHash = result.txHash;
              onChain = true;
            } catch (err) {
              console.log(`SOL swap failed: ${err.message}`);
            }
          }

          breakdown.push({
            coin: coin.coin,
            cryptoAmount: deductCrypto,
            usdValue: deductUSD,
            txHash,
            onChain,
            explorer: txHash
              ? coin.coin === 'ETH'
                ? `https://sepolia.etherscan.io/tx/${txHash}`
                : `https://solscan.io/tx/${txHash}?cluster=devnet`
              : null,
          });

          await Balance.updateOne(
            { userId, coin: coin.coin },
            { $inc: { amount: -deductCrypto }, $set: { updatedAt: new Date() } }
          );

          console.log(`Deducted ${deductCrypto.toFixed(8)} ${coin.coin} ($${deductUSD.toFixed(2)}) from user ${userId}`);
        }
      }

      const processingTimeMs = Date.now() - startTime;

      await Transaction.create({
        userId, type: 'pos_payment', fiatAmount, fiatCurrency,
        usdAmount, stripePaymentId: paymentIntent.id,
        breakdown, processingTimeMs, status: 'confirmed',
        note: priorityOrder
          ? `POS payment via Stripe — priority order`
          : `POS payment via Stripe — proportional split`,
      });

      console.log(`✓ POS Payment confirmed in ${processingTimeMs}ms`);
      console.log('Breakdown:');
      breakdown.forEach(b => {
        console.log(`  ${b.coin}: ${b.cryptoAmount.toFixed(8)} ($${b.usdValue.toFixed(2)}) ${b.onChain ? '✓ on-chain' : '⚠ MongoDB only'}`);
        if (b.explorer) console.log(`  Explorer: ${b.explorer}`);
      });

    } catch (err) {
      console.log('POS processing error:', err.message);
    }
  }

  res.json({ received: true });
};

// GET /api/pos/transactions
const getPOSTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await Transaction.find({
      userId, type: 'pos_payment'
    }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: transactions });
  } catch (err) {
    console.log('Get POS transactions error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/pos/summary
const getPOSSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTxns = await Transaction.find({
      userId, type: 'pos_payment', createdAt: { $gte: today }
    });

    const allTxns = await Transaction.find({ userId, type: 'pos_payment' });

    const totalTodayUSD = todayTxns
      .filter(t => t.status === 'confirmed')
      .reduce((sum, t) => sum + (t.usdAmount || 0), 0);

    const transactionsToday = todayTxns.filter(t => t.status === 'confirmed').length;
    const failedCount = allTxns.filter(t => t.status === 'declined').length;

    const coinCount = {};
    allTxns.forEach(tx => {
      if (tx.breakdown) {
        tx.breakdown.forEach(b => {
          coinCount[b.coin] = (coinCount[b.coin] || 0) + 1;
        });
      }
    });
    const mostUsed = Object.keys(coinCount).sort((a, b) => coinCount[b] - coinCount[a])[0] || 'N/A';

    res.json({
      success: true,
      data: { totalTodayUSD: totalTodayUSD.toFixed(2), transactionsToday, failedCount, mostUsed }
    });
  } catch (err) {
    console.log('Get POS summary error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { stripeWebhook, getPOSTransactions, getPOSSummary };