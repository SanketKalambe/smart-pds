const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  receiptNumber: { type: String, required: true, unique: true },
  qrCodeData: { type: String, required: true },
  qrImageUrl: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Receipt', receiptSchema);
