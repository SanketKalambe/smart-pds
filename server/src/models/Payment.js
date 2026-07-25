const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, default: 'pay_mock_sandbox_123' },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['created', 'captured', 'failed'], default: 'captured' },
  method: { type: String, default: 'UPI_SANDBOX' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
