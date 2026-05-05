const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  coin: {
    type:     String,
    required: true,
    uppercase: true,
  },
  amount: {
    type:    Number,
    default: 0,
  },
  lockedAmount: {
    type:    Number,
    default: 0,
  },
  updatedAt: {
    type:    Date,
    default: Date.now,
  },
});

// Compound index — one balance per coin per user
balanceSchema.index({ userId: 1, coin: 1 }, { unique: true });

module.exports = mongoose.model('Balance', balanceSchema);