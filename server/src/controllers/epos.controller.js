const ConsumerProfile = require('../models/ConsumerProfile');
const FamilyMember = require('../models/FamilyMember');
const Shop = require('../models/Shop');
const Transaction = require('../models/Transaction');
const Receipt = require('../models/Receipt');
const SlotBooking = require('../models/SlotBooking');
const DistributorProfile = require('../models/DistributorProfile');
const EposStateMachine = require('../services/epos.service');
const { generateReceiptQR } = require('../services/qr.service');
const { createRazorpayOrder } = require('../services/razorpay.service');

// @desc    e-POS Step 1: Scan Ration Card
// @route   POST /api/distributor/epos/scan
// @access  Private (Distributor)
const scanCard = async (req, res, next) => {
  try {
    const { rationCardNo } = req.body;
    if (!rationCardNo) {
      return res.status(400).json({ success: false, error: 'Ration Card Number is required.' });
    }

    const scanResult = await EposStateMachine.scanRationCard(
      rationCardNo,
      ConsumerProfile,
      FamilyMember
    );

    // Calculate current month remaining quota entitlement
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthTransactions = await Transaction.find({
      consumerProfile: scanResult.consumer.id,
      monthYear: currentMonth,
      paymentStatus: 'completed'
    });

    const entitlement = EposStateMachine.calculateEntitlement(scanResult.consumer.rationCardType, monthTransactions);

    // Check today's slot booking status
    const todayStr = new Date().toISOString().slice(0, 10);
    const activeBooking = await SlotBooking.findOne({
      consumerProfile: scanResult.consumer.id,
      date: todayStr,
      status: 'booked'
    });

    res.json({
      success: true,
      ...scanResult,
      entitlement,
      slotCheck: {
        hasBookingToday: !!activeBooking,
        timeSlot: activeBooking ? activeBooking.timeSlot : null
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    e-POS Step 2: Biometric Fingerprint Check
// @route   POST /api/distributor/epos/verify
// @access  Private (Distributor)
const verifyFingerprint = async (req, res, next) => {
  try {
    const { consumerId, memberId, fingerprintHash } = req.body;

    const consumer = await ConsumerProfile.findById(consumerId);
    if (!consumer) {
      return res.status(404).json({ success: false, error: 'Consumer profile not found.' });
    }

    const bioResult = await EposStateMachine.verifyFingerprint(consumer, memberId, fingerprintHash);

    if (!bioResult.verified) {
      return res.status(400).json({ success: false, ...bioResult });
    }

    res.json({ success: true, ...bioResult });
  } catch (err) {
    next(err);
  }
};

// @desc    e-POS Step 3: Dispense Ration & Record Transaction
// @route   POST /api/distributor/epos/dispense
// @access  Private (Distributor)
const dispenseRation = async (req, res, next) => {
  try {
    const { consumerId, selectedItems, verificationId } = req.body;

    const profile = await DistributorProfile.findOne({ user: req.user._id });
    if (!profile || !profile.shopId) {
      return res.status(404).json({ success: false, error: 'Distributor shop not found.' });
    }

    const consumer = await ConsumerProfile.findById(consumerId);
    if (!consumer) {
      return res.status(404).json({ success: false, error: 'Consumer not found.' });
    }

    // Get current entitlement
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthTransactions = await Transaction.find({
      consumerProfile: consumer._id,
      monthYear: currentMonth,
      paymentStatus: 'completed'
    });

    const entitlement = EposStateMachine.calculateEntitlement(consumer.rationCardType, monthTransactions);

    // Validate & compute dispense cost
    const dispenseResult = EposStateMachine.dispenseRation(selectedItems, entitlement);

    // Save transaction
    const transaction = await Transaction.create({
      consumerProfile: consumer._id,
      shop: profile.shopId,
      itemsDistributed: dispenseResult.dispensedItems,
      totalAmount: dispenseResult.totalAmount,
      paymentStatus: 'completed',
      biometricVerified: true,
      verificationLog: verificationId || 'BIO_VER_MOCK_APPROVED',
      monthYear: currentMonth
    });

    // Deduct stock from shop
    const shop = await Shop.findById(profile.shopId);
    if (shop) {
      dispenseResult.dispensedItems.forEach(dItem => {
        let stockItem = shop.stockAvailability.find(s => s.item === dItem.item);
        if (stockItem) {
          stockItem.quantityKg = Math.max(0, stockItem.quantityKg - dItem.quantity);
        }
      });
      await shop.save();
    }

    // Mark today's slot booking completed if exists
    const todayStr = new Date().toISOString().slice(0, 10);
    await SlotBooking.findOneAndUpdate(
      { consumerProfile: consumer._id, date: todayStr, status: 'booked' },
      { status: 'completed' }
    );

    // Create Razorpay Order
    const order = await createRazorpayOrder(dispenseResult.totalAmount, transaction._id.toString());

    res.json({
      success: true,
      message: 'Ration dispensed successfully via e-POS terminal.',
      transaction,
      order
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    e-POS Step 4: Generate QR Receipt
// @route   POST /api/distributor/epos/receipt
// @access  Private (Distributor)
const generateReceipt = async (req, res, next) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId)
      .populate('consumerProfile')
      .populate('shop');

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found.' });
    }

    const receiptNumber = `RCPT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const qrDataUrl = await generateReceiptQR({
      transactionId: transaction._id,
      rationCardNo: transaction.consumerProfile.rationCardNo,
      totalAmount: transaction.totalAmount,
      timestamp: transaction.timestamp,
      verificationHash: transaction.verificationLog
    });

    const receipt = await Receipt.create({
      transaction: transaction._id,
      receiptNumber,
      qrCodeData: JSON.stringify({ receiptNumber, transactionId: transaction._id }),
      qrImageUrl: qrDataUrl || 'data:image/png;base64,mockqr'
    });

    res.json({
      success: true,
      receiptNumber,
      qrImageUrl: receipt.qrImageUrl,
      transaction,
      receipt
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  scanCard,
  verifyFingerprint,
  dispenseRation,
  generateReceipt
};
