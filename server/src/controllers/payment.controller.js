const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const { createRazorpayOrder, verifyRazorpaySignature } = require('../services/razorpay.service');

// @desc    Create Razorpay Order
// @route   POST /api/distributor/payment/create-order
// @access  Private (Distributor)
const createOrder = async (req, res, next) => {
  try {
    const { amount, transactionId } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, error: 'Amount is required.' });
    }

    const order = await createRazorpayOrder(Number(amount), transactionId);

    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey12345',
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/distributor/payment/verify
// @access  Private (Distributor)
const verifyPayment = async (req, res, next) => {
  try {
    const { transactionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Payment signature verification failed.' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (transaction) {
      transaction.paymentStatus = 'completed';
      await transaction.save();
    }

    const payment = await Payment.create({
      transaction: transactionId,
      razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
      razorpaySignature,
      amount: transaction ? transaction.totalAmount : 0,
      status: 'captured',
      method: 'RAZORPAY_SANDBOX_UPI'
    });

    res.json({
      success: true,
      message: 'Razorpay Sandbox payment verified and captured.',
      payment
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  verifyPayment
};
