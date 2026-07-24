const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  merchantId: { type: String, required: true, unique: true },
  businessName: { type: String, required: true },
  iban: { type: String, required: true },
  currency: { type: String, default: 'EUR' },
  country: { type: String, default: 'IE' },
  totalReceived: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Merchant', merchantSchema);
