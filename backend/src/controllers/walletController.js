const Balance = require('../models/Balance');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');

const SUPPORTED_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'USDT', 'XRP', 'ADA', 'DOGE'];

// CONNECT WALLET
const connectWallet = async (req, res) => {
    try {
        const { address, walletName, walletType } = req.body;
        const userId = req.userId;

        if (!address || !walletName || !walletType) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        await Wallet.findOneAndUpdate(
            { userId },
            { userId, address, walletName, walletType, isActive: true, connectedAt: Date.now() },
            { upsert: true }
        );

        for (const coin of SUPPORTED_COINS) {
            const existing = await Balance.findOne({ userId, coin });
            if (!existing) {
                await Balance.create({ userId, coin, amount: 0, lockedAmount: 0 });
            }
        }

        res.json({ success: true, message: 'Wallet connected successfully' });

    } catch (err) {
        console.log('Connect wallet error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET BALANCES
const getBalances = async (req, res) => {
    try {
        const userId = req.userId;
        const balances = await Balance.find({ userId });

        // Create missing balances
        for (const coin of SUPPORTED_COINS) {
            const exists = balances.find(b => b.coin === coin);
            if (!exists) {
                await Balance.create({ userId, coin, amount: 0, lockedAmount: 0 });
            }
        }

        const updatedBalances = await Balance.find({ userId });
        res.json({ success: true, data: updatedBalances });

    } catch (err) {
        console.log('Get balances error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DEPOSIT
const deposit = async (req, res) => {
    try {
        const { coin, amount } = req.body;
        const userId = req.userId;

        if (!coin || !amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid deposit data' });
        }

        const coinUpper = coin.toUpperCase();
        const depositAmount = parseFloat(amount);

        // Get live price at time of deposit
        const { getMarkets } = require('../services/marketsService');
        const markets = getMarkets();
        const market = markets.find(m => m.symbol === coinUpper);
        const priceAtDeposit = market?.price || 0;
        const usdValue = depositAmount * priceAtDeposit;

        // Update balance
        const result = await Balance.updateOne(
            { userId, coin: coinUpper },
            { $inc: { amount: depositAmount }, $set: { updatedAt: new Date() } },
            { upsert: true }
        );

        const balance = await Balance.findOne({ userId, coin: coinUpper });

        // Record transaction with price
        await Transaction.create({
            userId,
            type: 'deposit',
            coin: coinUpper,
            amount: depositAmount,
            usdValue,
            priceAtDeposit,
            status: 'confirmed',
        });

        res.json({
            success: true,
            message: `${amount} ${coin} deposited successfully`,
            newBalance: balance.amount,
        });

    } catch (err) {
        console.log('Deposit error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// WITHDRAW
const withdraw = async (req, res) => {
    try {
        const { coin, amount, toAddress } = req.body;
        const userId = req.userId;

        if (!coin || !amount || !toAddress || parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid withdrawal data' });
        }

        const coinUpper = coin.toUpperCase();
        const withdrawAmount = parseFloat(amount);

        // Check MongoDB balance
        const balance = await Balance.findOne({ userId, coin: coinUpper });
        if (!balance || balance.amount < withdrawAmount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        let txHash = null;

        // For ETH use real blockchain withdrawal
        if (coinUpper === 'ETH') {
            try {
                const { withdrawETH } = require('../services/alchemyService');
                const result = await withdrawETH(userId, toAddress, withdrawAmount);
                txHash = result.txHash;
            } catch (err) {
                return res.status(400).json({ success: false, message: err.message });
            }
        }
        if (coinUpper === 'SOL') {
            try {
                const { withdrawSOL } = require('../services/solanaService');
                const result = await withdrawSOL(userId, toAddress, withdrawAmount);
                txHash = result.txHash;
            } catch (err) {
                return res.status(400).json({ success: false, message: err.message });
            }
        }

        // Deduct balance from MongoDB
        await Balance.updateOne(
            { userId, coin: coinUpper },
            { $inc: { amount: -withdrawAmount }, $set: { updatedAt: new Date() } }
        );

        // Record transaction
        await Transaction.create({
            userId,
            type: 'withdraw',
            coin: coinUpper,
            amount: withdrawAmount,
            toAddress,
            txHash,
            status: 'confirmed',
        });

        res.json({
            success: true,
            message: `${amount} ${coin} withdrawn successfully`,
            txHash,
        });

    } catch (err) {
        console.log('Withdraw error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// SWAP
const swap = async (req, res) => {
    try {
        const { fromCoin, toCoin, fromAmount } = req.body;
        const userId = req.userId;

        if (!fromCoin || !toCoin || !fromAmount || parseFloat(fromAmount) <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid swap data' });
        }

        const fromCoinUpper = fromCoin.toUpperCase();
        const toCoinUpper = toCoin.toUpperCase();
        const amount = parseFloat(fromAmount);

        const balance = await Balance.findOne({ userId, coin: fromCoinUpper });
        if (!balance || balance.amount < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        const { getMarkets } = require('../services/marketsService');
        const markets = getMarkets();
        const fromMarket = markets.find(m => m.symbol === fromCoinUpper);
        const toMarket = markets.find(m => m.symbol === toCoinUpper);

        if (!fromMarket || !toMarket) {
            return res.status(400).json({ success: false, message: 'Coin not supported for swap' });
        }

        const fromUSD = amount * fromMarket.price;
        const toAmount = fromUSD / toMarket.price;

        await Balance.updateOne(
            { userId, coin: fromCoinUpper },
            { $inc: { amount: -amount }, $set: { updatedAt: new Date() } }
        );

        await Balance.updateOne(
            { userId, coin: toCoinUpper },
            { $inc: { amount: toAmount }, $set: { updatedAt: new Date() } },
            { upsert: true }
        );

        await Transaction.create({
            userId,
            type: 'swap',
            fromCoin: fromCoinUpper,
            toCoin: toCoinUpper,
            fromAmount: amount,
            toAmount,
            usdValue: fromUSD,
            status: 'confirmed',
        });

        res.json({
            success: true,
            message: `Swapped ${fromAmount} ${fromCoin} to ${toAmount.toFixed(6)} ${toCoin}`,
            fromAmount: amount,
            toAmount,
        });

    } catch (err) {
        console.log('Swap error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET TRANSACTIONS
const getTransactions = async (req, res) => {
    try {
        const userId = req.userId;
        const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, data: transactions });
    } catch (err) {
        console.log('Get transactions error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { connectWallet, getBalances, deposit, withdraw, swap, getTransactions };