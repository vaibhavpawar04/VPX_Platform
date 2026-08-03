const cron = require('node-cron');
const User = require('../models/User');
const Balance = require('../models/Balance');
const Transaction = require('../models/Transaction');
const PortfolioSnapshot = require('../models/PortfolioSnapshot');

const calculateUserPortfolio = async (userId) => {
  const { getMarkets } = require('./marketsService');
  const markets = getMarkets();

  const balances = await Balance.find({ userId, amount: { $gt: 0 } });
  const deposits = await Transaction.find({ userId, type: 'deposit', status: 'confirmed' });

  let totalValue = 0;
  let totalInvested = 0;

  for (const bal of balances) {
    const market = markets.find(m => m.symbol === bal.coin);
    const currentPrice = market?.price || 0;
    const currentValue = bal.amount * currentPrice;
    totalValue += currentValue;

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
    totalInvested += bal.amount * avgBuyPrice;
  }

  return { totalValue, totalInvested };
};

const snapshotAllUsers = async () => {
  try {
    const users = await User.find({}, '_id');
    let count = 0;

    for (const user of users) {
      const { totalValue, totalInvested } = await calculateUserPortfolio(user._id);
      await PortfolioSnapshot.create({
        userId: user._id,
        totalValue,
        totalInvested,
      });
      count++;
    }

    console.log(`✓ Portfolio snapshots saved for ${count} users`);
  } catch (err) {
    console.log('Snapshot error:', err.message);
  }
};

const startSnapshotScheduler = () => {
  // Runs once daily at midnight UTC
  cron.schedule('0 0 * * *', () => {
    console.log('Running daily portfolio snapshot...');
    snapshotAllUsers();
  });
  console.log('✓ Portfolio snapshot scheduler started (daily at midnight UTC)');
};

module.exports = { startSnapshotScheduler, snapshotAllUsers, calculateUserPortfolio };
