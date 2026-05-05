const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  address: {
    type:     String,
    required: true,
  },
  walletName: {
    type:     String,
    required: true,
  },
  walletType: {
    type:    String,
    enum:    ['ethereum', 'solana'],
    required: true,
  },
  isActive: {
    type:    Boolean,
    default: true,
  },
  connectedAt: {
    type:    Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Wallet', walletSchema);