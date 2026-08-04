const mongoose = require('mongoose');

const paymentPreferenceSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    unique:   true,
  },
  mode: {
    type:    String,
    enum:    ['priority', 'weighted', 'direct_crypto'],
    default: 'priority',
  },
  fallbackSplitMode: {
    type:    String,
    enum:    ['priority', 'weighted'],
    default: 'priority',
  },
  priorityOrder: {
    type:    [String],
    default: ['BTC', 'ETH', 'SOL', 'BASE', 'ARB', 'BNB', 'USDT', 'XRP', 'ADA', 'DOGE'],
  },
  excludedCoins: {
    type:    [String],
    default: [],
  },
  updatedAt: {
    type:    Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PaymentPreference', paymentPreferenceSchema);
