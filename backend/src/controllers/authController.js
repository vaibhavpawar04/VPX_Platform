const User = require('../models/User');
const Balance = require('../models/Balance');
const jwt  = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

const SUPPORTED_COINS = ['BTC', 'ETH', 'SOL', 'BASE', 'ARB', 'BNB', 'USDT', 'XRP', 'ADA', 'DOGE'];

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1y' });
};

const setupNewUser = async (userId) => {
  try {
    const { generateArbitrumDepositAddress } = require('../services/arbitrumService');
    const arbAddress = await generateArbitrumDepositAddress(userId);
    console.log(`✓ ARB wallet generated for user ${userId}: ${arbAddress}`);

    const { generateBaseDepositAddress } = require('../services/baseService');
    const baseAddress = await generateBaseDepositAddress(userId);
    console.log(`✓ BASE wallet generated for user ${userId}: ${baseAddress}`);

    const { generateDepositAddress, monitorAddress } = require('../services/alchemyService');
    const ethAddress = await generateDepositAddress(userId);
    monitorAddress(ethAddress.toLowerCase(), userId);
    console.log(`✓ ETH wallet generated for user ${userId}: ${ethAddress}`);

    const { generateSolanaDepositAddress, monitorSolanaAddress } = require('../services/solanaService');
    const solAddress = await generateSolanaDepositAddress(userId);
    monitorSolanaAddress(solAddress, userId);
    console.log(`✓ SOL wallet generated for user ${userId}: ${solAddress}`);

    for (const coin of SUPPORTED_COINS) {
      const existing = await Balance.findOne({ userId, coin });
      if (!existing) {
        await Balance.create({ userId, coin, amount: 0, lockedAmount: 0 });
      }
    }
    console.log(`✓ Balances initialized for user ${userId}`);

  } catch (err) {
    console.log('Setup new user error:', err.message);
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    });

    await setupNewUser(user._id);

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(user.email, user.name, verificationLink);

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      token,
      user: {
        id:          user._id,
        name:        user.name,
        email:       user.email,
        accountType: user.accountType,
        kycStatus:   user.kycStatus,
        isVerified:  user.isVerified,
      }
    });
  } catch (err) {
    console.log('Register error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    await setupNewUser(user._id);

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:          user._id,
        name:        user.name,
        email:       user.email,
        accountType: user.accountType,
        kycStatus:   user.kycStatus,
        isVerified:  user.isVerified,
      }
    });
  } catch (err) {
    console.log('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.log('Verify email error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.log('GetMe error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, getMe, setupNewUser, verifyEmail };
