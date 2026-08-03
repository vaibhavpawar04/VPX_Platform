const mongoose = require('mongoose');

const portfolioSnapshotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  totalValue: {
    type: Number,
    required: true,
  },
  totalInvested: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for fast "closest snapshot before date" queries per user
portfolioSnapshotSchema.index({ userId: 1, createdAt: 1 });

module.exports = mongoose.model('PortfolioSnapshot', portfolioSnapshotSchema);
