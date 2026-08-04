const Balance = require('../models/Balance');
const Transaction = require('../models/Transaction');
const PaymentPreference = require('../models/PaymentPreference');
const Merchant = require('../models/Merchant');
const { processMerchantPayout } = require('../services/payoutService');
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

const executeSwap = async (userId, coin, cryptoAmount) => {
  let txHash = null;
  let onChain = false;

  if (coin === 'ETH') {
    try {
      const { swapETHToUSDC } = require('../services/uniswapService');
      const result = await swapETHToUSDC(userId, parseFloat(cryptoAmount.toFixed(8)));
      txHash = result.txHash;
      onChain = true;
    } catch (err) {
      console.log(`ETH swap failed, MongoDB only: ${err.message}`);
    }
  } else if (coin === 'SOL') {
    try {
      const { swapSOLToUSDC } = require('../services/orcaService');
      const result = await swapSOLToUSDC(userId, parseFloat(cryptoAmount.toFixed(8)));
      txHash = result.txHash;
      onChain = true;
    } catch (err) {
      console.log(`SOL swap failed, MongoDB only: ${err.message}`);
    }
  } else if (coin === 'ARB') {
    try {
      const { swapArbitrumETHToUSDC } = require('../services/arbitrumService');
      const result = await swapArbitrumETHToUSDC(userId, parseFloat(cryptoAmount.toFixed(8)));
      txHash = result.txHash;
      onChain = true;
    } catch (err) {
      console.log(`ARB swap failed, MongoDB only: ${err.message}`);
    }
  } else if (coin === 'BASE') {
    try {
      const { swapBaseETHToUSDC } = require('../services/baseService');
      const result = await swapBaseETHToUSDC(userId, parseFloat(cryptoAmount.toFixed(8)));
      txHash = result.txHash;
      onChain = true;
    } catch (err) {
      console.log(`BASE swap failed, MongoDB only: ${err.message}`);
    }
  }

  return { txHash, onChain };
};

const explorerUrl = (coin, txHash) => {
  if (!txHash) return null;
  if (coin === 'ETH' || coin === 'ARB' || coin === 'BASE') {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
  return `https://solscan.io/tx/${txHash}?cluster=devnet`;
};

const buildSpendPlan = (coinValues, totalWalletUSD, usdAmount, splitMode, priorityOrder) => {
  if (splitMode === 'priority') {
    const ordered = [...coinValues].sort((a, b) => {
      const aIndex = (priorityOrder || []).indexOf(a.coin);
      const bIndex = (priorityOrder || []).indexOf(b.coin);
      const aRank = aIndex === -1 ? 999 : aIndex;
      const bRank = bIndex === -1 ? 999 : bIndex;
      return aRank - bRank;
    });

    const plan = [];
    let remainingUSD = usdAmount;
    for (const coin of ordered) {
      if (remainingUSD <= 0) break;
      const useUSD = Math.min(coin.usdValue, remainingUSD);
      plan.push({ ...coin, useUSD });
      remainingUSD -= useUSD;
    }
    return plan;
  }

  return coinValues.map(coin => {
    const weight = coin.usdValue / totalWalletUSD;
    return { ...coin, useUSD: usdAmount * weight };
  });
};

const processPayment = async (paymentIntent, placeholderId) => {
  const startTime = Date.now();
  try {
    const fiatAmount = paymentIntent.amount / 100;
    const fiatCurrency = paymentIntent.currency.toUpperCase();
    const userId = paymentIntent.metadata?.userId;
    const merchantId = paymentIntent.metadata?.merchantId;

    console.log(`POS Payment received: ${fiatAmount} ${fiatCurrency} for user ${userId}`);
    console.log(`Merchant: ${merchantId || 'not specified'}`);

    if (!userId) {
      console.log('No userId in payment metadata — skipping');
      await Transaction.findByIdAndUpdate(placeholderId, { status: 'declined', note: 'No userId in metadata' });
      return;
    }

    let usdAmount;
    if (fiatCurrency === 'USD') {
      usdAmount = fiatAmount;
    } else {
      const rate = await getUSDRate(fiatCurrency);
      usdAmount = fiatAmount / rate;
    }
    console.log(`Converted ${fiatAmount} ${fiatCurrency} → $${usdAmount.toFixed(2)} USD`);

    const { getMarkets } = require('../services/marketsService');
    const markets = getMarkets();

    const merchant = merchantId ? await Merchant.findOne({ merchantId }) : null;

    const balances = await Balance.find({ userId, amount: { $gt: 0 } });

    if (!balances.length) {
      await Transaction.findByIdAndUpdate(placeholderId, {
        fiatAmount, fiatCurrency, usdAmount,
        breakdown: [], processingTimeMs: Date.now() - startTime,
        status: 'declined', note: 'No wallet balance',
      });
      console.log('POS Payment declined — no balance');
      return;
    }

    const prefs = await PaymentPreference.findOne({ userId });
    const excludedCoins = prefs?.excludedCoins || [];
    const priorityOrder = prefs?.priorityOrder || null;
    const mode = prefs?.mode || 'priority';
    const fallbackSplitMode = prefs?.fallbackSplitMode || 'priority';

    const directCryptoAvailable = mode === 'direct_crypto' && !!merchant?.acceptsCrypto && !!merchant?.cryptoAddress;
    const isDirectCrypto = mode === 'direct_crypto' && directCryptoAvailable;

    let splitMode;
    if (mode === 'direct_crypto') {
      splitMode = fallbackSplitMode;
    } else {
      splitMode = mode;
    }

    console.log(`Payment mode: ${mode}${mode === 'direct_crypto' ? (directCryptoAvailable ? ' (merchant accepts crypto)' : ' (merchant does not accept crypto — falling back)') : ''}`);
    console.log(`Split mode: ${splitMode}`);

    const availableBalances = balances.filter(b => !excludedCoins.includes(b.coin));

    if (!availableBalances.length) {
      await Transaction.findByIdAndUpdate(placeholderId, {
        fiatAmount, fiatCurrency, usdAmount,
        breakdown: [], processingTimeMs: Date.now() - startTime,
        status: 'declined', note: 'All coins excluded by user preferences',
      });
      console.log('POS Payment declined — all coins excluded');
      return;
    }

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

    if (totalWalletUSD < usdAmount) {
      await Transaction.findByIdAndUpdate(placeholderId, {
        fiatAmount, fiatCurrency, usdAmount,
        breakdown: [], processingTimeMs: Date.now() - startTime,
        status: 'declined',
        note: `Insufficient balance. Required: $${usdAmount.toFixed(2)}, Available: $${totalWalletUSD.toFixed(2)}`,
      });
      console.log('POS Payment declined — insufficient balance');
      return;
    }

    const spendPlan = buildSpendPlan(coinValues, totalWalletUSD, usdAmount, splitMode, priorityOrder);

    const breakdown = [];
    let totalUSDCSwapped = 0;
    let totalDirectCryptoUSD = 0;

    for (const coin of spendPlan) {
      if (coin.useUSD <= 0) continue;
      const useCrypto = coin.useUSD / coin.price;

      let txHash = null;
      let onChain = false;

      if (isDirectCrypto) {
        console.log(`Sending ${useCrypto.toFixed(8)} ${coin.coin} directly to merchant ${merchant.cryptoAddress}`);
        totalDirectCryptoUSD += coin.useUSD;
      } else {
        const swapResult = await executeSwap(userId, coin.coin, useCrypto);
        txHash = swapResult.txHash;
        onChain = swapResult.onChain;
        totalUSDCSwapped += coin.useUSD;
      }

      breakdown.push({
        coin: coin.coin,
        cryptoAmount: useCrypto,
        usdValue: coin.useUSD,
        txHash,
        onChain,
        directToMerchant: isDirectCrypto,
        explorer: explorerUrl(coin.coin, txHash),
      });

      await Balance.updateOne(
        { userId, coin: coin.coin },
        { $inc: { amount: -useCrypto }, $set: { updatedAt: new Date() } }
      );

      console.log(`Deducted ${useCrypto.toFixed(8)} ${coin.coin} ($${coin.useUSD.toFixed(2)}) from user ${userId}`);
    }

    const processingTimeMs = Date.now() - startTime;

    let merchantPayout = null;
    if (merchantId && isDirectCrypto) {
      try {
        await Merchant.updateOne({ merchantId }, { $inc: { totalReceived: totalDirectCryptoUSD } });
        merchantPayout = {
          businessName: merchant.businessName,
          iban: merchant.iban,
          fiatAmount: totalDirectCryptoUSD,
          currency: 'USD (crypto)',
          payoutMethod: 'direct_crypto',
          exchangeRate: 1,
          cryptoAddress: merchant.cryptoAddress,
        };
        console.log(`✓ Direct crypto payout recorded for merchant ${merchantId}`);
      } catch (err) {
        console.log(`Direct crypto merchant credit failed: ${err.message}`);
      }
    } else if (merchantId) {
      try {
        console.log(`\n── Initiating merchant payout ──`);
        console.log(`USDC in treasury: $${totalUSDCSwapped.toFixed(2)}`);
        merchantPayout = await processMerchantPayout(
          merchantId,
          totalUSDCSwapped,
          breakdown[0]?.txHash || null
        );
        console.log(`✓ Merchant payout complete!`);
      } catch (err) {
        console.log(`Merchant payout failed: ${err.message}`);
      }
    }

    await Transaction.findByIdAndUpdate(placeholderId, {
      fiatAmount, fiatCurrency, usdAmount,
      breakdown, processingTimeMs, status: 'confirmed',
      note: isDirectCrypto
        ? `POS payment via Stripe — direct crypto to merchant`
        : splitMode === 'priority'
          ? `POS payment via Stripe — priority order`
          : `POS payment via Stripe — proportional split`,
      merchantPayout: merchantPayout || null,
    });

    console.log(`\n✓ POS Payment confirmed in ${processingTimeMs}ms`);
    console.log('Breakdown:');
    breakdown.forEach(b => {
      console.log(`  ${b.coin}: ${b.cryptoAmount.toFixed(8)} ($${b.usdValue.toFixed(2)}) ${b.directToMerchant ? '→ direct to merchant' : b.onChain ? '✓ on-chain swap' : '⚠ MongoDB only'}`);
      if (b.explorer) console.log(`  Explorer: ${b.explorer}`);
    });

    if (merchantPayout) {
      console.log(`\n── Merchant Payout Summary ──`);
      console.log(`  Business: ${merchantPayout.businessName}`);
      console.log(`  IBAN: ${merchantPayout.iban}`);
      console.log(`  Amount: ${merchantPayout.fiatAmount} ${merchantPayout.currency}`);
      console.log(`  Method: ${merchantPayout.payoutMethod}`);
    }

  } catch (err) {
    console.log('POS processing error:', err.message);
    await Transaction.findByIdAndUpdate(placeholderId, { status: 'failed', note: err.message }).catch(() => {});
  }
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

  if (event.type !== 'payment_intent.succeeded') {
    return res.json({ received: true });
  }

  const paymentIntent = event.data.object;

  let placeholder;
  try {
    placeholder = await Transaction.create({
      userId: paymentIntent.metadata?.userId || null,
      type: 'pos_payment',
      stripePaymentId: paymentIntent.id,
      status: 'pending',
    });
  } catch (err) {
    if (err.code === 11000) {
      console.log('Duplicate webhook delivery detected, skipping:', paymentIntent.id);
    } else {
      console.log('Failed to create transaction placeholder:', err.message);
    }
    return res.json({ received: true });
  }

  res.json({ received: true });

  processPayment(paymentIntent, placeholder._id);
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


// GET /api/pos/merchants
const getMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find({}, 'merchantId businessName currency acceptsCrypto');
    res.json({ success: true, data: merchants });
  } catch (err) {
    console.log('Get merchants error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/pos/simulate-payment (creates and confirms a real Stripe test payment)
const simulatePayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, currency, merchantId } = req.body;

    if (!amount || !currency || !merchantId) {
      return res.status(400).json({ success: false, message: 'amount, currency, and merchantId are required' });
    }

    const stripe = getStripe();
    const amountInSmallestUnit = Math.round(parseFloat(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      payment_method: 'pm_card_visa',
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      metadata: { userId, merchantId },
    });

    res.json({ success: true, message: 'Test payment triggered', paymentIntentId: paymentIntent.id, status: paymentIntent.status });
  } catch (err) {
    console.log('Simulate payment error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { stripeWebhook, getPOSTransactions, getPOSSummary, getMerchants, simulatePayment };
