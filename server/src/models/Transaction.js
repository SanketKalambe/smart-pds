const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  consumerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsumerProfile', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  itemsDistributed: [{
    item: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    pricePerKg: { type: Number, required: true },
    cost: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  biometricVerified: { type: Boolean, default: true },
  verificationLog: { type: String, default: 'EPOS_BIO_MATCH_PASSED' },
  monthYear: { type: String, required: true }, // e.g. "2026-07"
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
