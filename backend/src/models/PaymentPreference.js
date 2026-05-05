const mongoose = require('mongoose');

const paymentPreferenceSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    unique:   true,
  },
  priorityOrder: {
    type:    [String],
    default: ['BTC', 'ETH', 'SOL', 'BNB', 'USDT', 'XRP', 'ADA', 'DOGE'],
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