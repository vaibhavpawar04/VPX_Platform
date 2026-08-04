const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  type: {
    type:     String,
    enum:     ['deposit', 'withdraw', 'swap', 'trade', 'pos_payment'],
    required: true,
  },
  fromCoin:   { type: String, uppercase: true },
  toCoin:     { type: String, uppercase: true },
  fromAmount: { type: Number },
  toAmount:   { type: Number },
  coin:       { type: String, uppercase: true },
  amount:     { type: Number },
  usdValue:   { type: Number, default: 0 },
  priceAtDeposit: { type: Number, default: 0 },
  status: {
    type:    String,
    enum:    ['pending', 'confirmed', 'failed', 'declined'],
    default: 'confirmed',
  },
  txHash:      { type: String },
  fromAddress: { type: String },
  toAddress:   { type: String },
  note:        { type: String },
  // POS specific fields
  fiatAmount:       { type: Number },
  fiatCurrency:     { type: String },
  usdAmount:        { type: Number },
  stripePaymentId:  { type: String, unique: true, sparse: true },
  breakdown:        { type: Array, default: [] },
  processingTimeMs: { type: Number },
  // Merchant payout
  merchantPayout: {
    merchantId:   { type: String },
    businessName: { type: String },
    iban:         { type: String },
    usdcAmount:   { type: Number },
    fiatAmount:   { type: Number },
    currency:     { type: String },
    country:      { type: String },
    exchangeRate: { type: Number },
    payoutMethod: { type: String },
    status:       { type: String },
    processingMs: { type: Number },
    txHash:       { type: String },
    simulatedAt:  { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
