const Balance = require('../models/Balance');
const Transaction = require('../models/Transaction');

const COIN_NAMES = {
  BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana',
  BNB: 'BNB', USDT: 'Tether', XRP: 'XRP',
  ADA: 'Cardano', DOGE: 'Dogecoin',
};

const COIN_ICONS = {
  BTC: '₿', ETH: 'Ξ', SOL: '◎', BNB: 'B',
  USDT: '₮', XRP: 'X', ADA: 'A', DOGE: 'D',
};

const WATCHLIST_COINS = ['ADA', 'XRP', 'DOGE', 'AVAX', 'DOT', 'MATIC'];

// GET /api/portfolio/holdings
const getHoldings = async (req, res) => {
  try {
    const userId = req.userId;
    const { getMarkets } = require('../services/marketsService');
    const markets = getMarkets();

    // Get all balances with amount > 0
    const balances = await Balance.find({ userId, amount: { $gt: 0 } });

    // Get all deposit transactions to calculate avg buy price
    const deposits = await Transaction.find({
      userId,
      type: 'deposit',
      status: 'confirmed',
    });

    // Calculate total portfolio value
    let totalValue = 0;
    const holdingsWithValue = [];

    for (const bal of balances) {
      const market = markets.find(m => m.symbol === bal.coin);
      const currentPrice = market?.price || 0;
      const currentValue = bal.amount * currentPrice;
      totalValue += currentValue;
      holdingsWithValue.push({ ...bal.toObject(), currentPrice, currentValue });
    }

    // Build holdings with P&L
    const holdings = holdingsWithValue.map(h => {
      // Get all deposits for this coin
      const coinDeposits = deposits.filter(d => d.coin === h.coin);

      let totalCost = 0;
      let totalDeposited = 0;

      for (const dep of coinDeposits) {
        if (dep.priceAtDeposit && dep.priceAtDeposit > 0) {
          totalCost += dep.amount * dep.priceAtDeposit;
          totalDeposited += dep.amount;
        } else {
          // Old deposit — use current price (P&L = 0 for this deposit)
          totalCost += dep.amount * h.currentPrice;
          totalDeposited += dep.amount;
        }
      }

      const avgBuyPrice = totalDeposited > 0 ? totalCost / totalDeposited : h.currentPrice;
      const investedValue = h.amount * avgBuyPrice;
      const pl = h.currentValue - investedValue;
      const plPct = investedValue > 0 ? (pl / investedValue) * 100 : 0;
      const allocation = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;

      return {
        name:       COIN_NAMES[h.coin] || h.coin,
        symbol:     h.coin,
        icon:       COIN_ICONS[h.coin] || '🪙',
        amount:     h.amount.toFixed(6),
        avgBuyPrice,
        currentPrice: h.currentPrice,
        currentValue: h.currentValue,
        investedValue,
        pl,
        plPct,
        allocation:   parseFloat(allocation.toFixed(1)),
        positive:     pl >= 0,
      };
    });

    // Sort by value descending
    holdings.sort((a, b) => b.currentValue - a.currentValue);

    res.json({ success: true, data: holdings });

  } catch (err) {
    console.log('Get holdings error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/portfolio/summary
const getSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const { getMarkets } = require('../services/marketsService');
    const markets = getMarkets();

    const balances = await Balance.find({ userId, amount: { $gt: 0 } });
    const deposits = await Transaction.find({ userId, type: 'deposit', status: 'confirmed' });

    let totalValue = 0;
    let totalInvested = 0;
    let bestAsset = { symbol: 'N/A', plPct: -Infinity };
    let worstAsset = { symbol: 'N/A', plPct: Infinity };

    for (const bal of balances) {
      const market = markets.find(m => m.symbol === bal.coin);
      const currentPrice = market?.price || 0;
      const currentValue = bal.amount * currentPrice;
      totalValue += currentValue;

      // Calculate invested value
      const coinDeposits = deposits.filter(d => d.coin === bal.coin);
      let totalCost = 0;
      let totalDeposited = 0;

      for (const dep of coinDeposits) {
        if (dep.priceAtDeposit && dep.priceAtDeposit > 0) {
          totalCost += dep.amount * dep.priceAtDeposit;
          totalDeposited += dep.amount;
        } else {
          totalCost += dep.amount * currentPrice;
          totalDeposited += dep.amount;
        }
      }

      const avgBuyPrice = totalDeposited > 0 ? totalCost / totalDeposited : currentPrice;
      const investedValue = bal.amount * avgBuyPrice;
      totalInvested += investedValue;

      const pl = currentValue - investedValue;
      const plPct = investedValue > 0 ? (pl / investedValue) * 100 : 0;

      if (plPct > bestAsset.plPct) bestAsset = { symbol: bal.coin, plPct };
      if (plPct < worstAsset.plPct) worstAsset = { symbol: bal.coin, plPct };
    }

    const totalPL = totalValue - totalInvested;
    const totalPLPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalValue:    totalValue.toFixed(2),
        totalInvested: totalInvested.toFixed(2),
        totalPL:       totalPL.toFixed(2),
        totalPLPct:    totalPLPct.toFixed(2),
        bestAsset:     bestAsset.symbol,
        worstAsset:    worstAsset.symbol,
        positive:      totalPL >= 0,
      }
    });

  } catch (err) {
    console.log('Get summary error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/portfolio/trades
const getTrades = async (req, res) => {
  try {
    const userId = req.userId;
    const { getMarkets } = require('../services/marketsService');
    const markets = getMarkets();

    const transactions = await Transaction.find({
      userId,
      type: { $in: ['deposit', 'withdraw', 'swap'] },
    }).sort({ createdAt: -1 }).limit(50);

    const trades = transactions.map(tx => {
      if (tx.type === 'swap') {
        const toMarket = markets.find(m => m.symbol === tx.toCoin);
        const toPrice = toMarket?.price || 0;
        return {
          type:   'SWAP',
          coin:   `${tx.fromCoin} → ${tx.toCoin}`,
          amount: `${tx.fromAmount?.toFixed(6)} ${tx.fromCoin}`,
          price:  `$${toPrice.toFixed(2)}`,
          total:  `$${tx.usdValue?.toFixed(2) || '0.00'}`,
          date:   tx.createdAt,
        };
      }

      const market = markets.find(m => m.symbol === tx.coin);
      const price = tx.priceAtDeposit || market?.price || 0;

      return {
        type:   tx.type === 'deposit' ? 'BUY' : 'SELL',
        coin:   tx.coin,
        amount: `${tx.amount?.toFixed(6)} ${tx.coin}`,
        price:  `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        total:  `$${(tx.usdValue || 0).toFixed(2)}`,
        date:   tx.createdAt,
      };
    });

    res.json({ success: true, data: trades });

  } catch (err) {
    console.log('Get trades error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/portfolio/watchlist
const getWatchlist = async (req, res) => {
  try {
    const { getMarkets } = require('../services/marketsService');
    const markets = getMarkets();

    const watchlistCoins = WATCHLIST_COINS.map(symbol => {
      const market = markets.find(m => m.symbol === symbol);
      return {
        name:     market?.name || symbol,
        symbol,
        icon:     COIN_ICONS[symbol] || '🪙',
        price:    market?.price || 0,
        change24h: market?.change24h || 0,
        positive: (market?.change24h || 0) >= 0,
      };
    }).filter(w => w.price > 0);

    res.json({ success: true, data: watchlistCoins });

  } catch (err) {
    console.log('Get watchlist error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getHoldings, getSummary, getTrades, getWatchlist };