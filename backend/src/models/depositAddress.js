const mongoose = require('mongoose');

const depositAddressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    coin: {
        type: String,
        required: true,
        uppercase: true,
    },
    address: {
        type: String,
        required: true,
    },
    privateKey: {
        type: String,
        required: true,
    },
    network: {
        type: String,
        default: 'sepolia',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// One deposit address per user per coin per network
depositAddressSchema.index({ userId: 1, coin: 1, network: 1 }, { unique: true });

module.exports = mongoose.model('DepositAddress', depositAddressSchema);