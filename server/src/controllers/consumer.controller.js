const ConsumerProfile = require('../models/ConsumerProfile');
const FamilyMember = require('../models/FamilyMember');
const Shop = require('../models/Shop');
const Transaction = require('../models/Transaction');
const SlotBooking = require('../models/SlotBooking');
const SystemSettings = require('../models/SystemSettings');
const Receipt = require('../models/Receipt');
const EposStateMachine = require('../services/epos.service');
const { encrypt, maskAadhaar } = require('../services/encryption.service');

// @desc    Get Digital Ration Book data
// @route   GET /api/consumer/ration-book
// @access  Private (Consumer)
const getRationBook = async (req, res, next) => {
  try {
    const profile = await ConsumerProfile.findOne({ user: req.user._id })
      .populate('user', 'name email phone status')
      .populate('assignedShopId', 'shopName shopCode address wardDistrict');

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Consumer profile not found.' });
    }

    const familyMembers = await FamilyMember.find({ consumerProfile: profile._id });

    // Fetch transactions for the current month to compute remaining entitlement
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthTransactions = await Transaction.find({
      consumerProfile: profile._id,
      monthYear: currentMonth,
      paymentStatus: 'completed'
    });

    const entitlementSummary = EposStateMachine.calculateEntitlement(profile.rationCardType, monthTransactions);

    // Fetch complete historical transaction log (digital ration book ledger)
    const transactionHistory = await Transaction.find({ consumerProfile: profile._id })
      .populate('shop', 'shopName shopCode')
      .sort({ timestamp: -1 });

    const settings = await SystemSettings.findOne() || { helplineNumber: '1800-11-1967' };

    res.json({
      success: true,
      digitalRationBook: {
        rationCardNo: profile.rationCardNo,
        cardType: profile.rationCardType,
        verified: profile.rationCardVerified,
        headOfHousehold: profile.headOfHouseholdName || profile.user.name,
        address: profile.address,
        status: profile.user.status,
        assignedShop: profile.assignedShopId,
        familyMembers: familyMembers.map(m => ({
          id: m._id,
          name: m.name,
          relation: m.relation,
          dateOfBirth: m.dateOfBirth,
          aadhaarMasked: m.aadhaarMasked
        })),
        entitlementSummary,
        transactionHistory,
        helplineNumber: settings.helplineNumber
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Consumer Dashboard summary
// @route   GET /api/consumer/dashboard
// @access  Private (Consumer)
const getConsumerDashboard = async (req, res, next) => {
  try {
    const profile = await ConsumerProfile.findOne({ user: req.user._id })
      .populate('assignedShopId');

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Consumer profile not found.' });
    }

    const familyMembers = await FamilyMember.find({ consumerProfile: profile._id });

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthTransactions = await Transaction.find({
      consumerProfile: profile._id,
      monthYear: currentMonth,
      paymentStatus: 'completed'
    });

    const entitlementSummary = EposStateMachine.calculateEntitlement(profile.rationCardType, monthTransactions);

    // Fetch active slot booking if any
    const upcomingBooking = await SlotBooking.findOne({
      consumerProfile: profile._id,
      status: 'booked',
      date: { $gte: new Date().toISOString().slice(0, 10) }
    }).sort({ date: 1 });

    const settings = await SystemSettings.findOne() || { helplineNumber: '1800-11-1967' };

    res.json({
      success: true,
      cardInfo: {
        rationCardNo: profile.rationCardNo,
        cardType: profile.rationCardType,
        headName: profile.headOfHouseholdName,
        status: profile.user.status
      },
      assignedShop: profile.assignedShopId,
      familyCount: familyMembers.length,
      entitlementSummary,
      upcomingBooking,
      helplineNumber: settings.helplineNumber
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add family member to consumer profile
// @route   PATCH /api/consumer/family-members
// @access  Private (Consumer)
const addFamilyMember = async (req, res, next) => {
  try {
    const { name, relation, dateOfBirth, aadhaarNumber } = req.body;
    const profile = await ConsumerProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Consumer profile not found.' });
    }

    const encryptedAadhaar = encrypt(aadhaarNumber);
    const maskedAadhaar = maskAadhaar(aadhaarNumber);

    const member = await FamilyMember.create({
      consumerProfile: profile._id,
      name,
      relation,
      dateOfBirth,
      aadhaarEncrypted: encryptedAadhaar,
      aadhaarMasked: maskedAadhaar
    });

    res.status(201).json({
      success: true,
      message: 'Family member added to ration card successfully.',
      member: {
        id: member._id,
        name: member.name,
        relation: member.relation,
        aadhaarMasked: member.aadhaarMasked
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get transaction receipt details with QR
// @route   GET /api/consumer/receipts/:id
// @access  Private (Consumer)
const getReceiptById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const receipt = await Receipt.findById(id).populate({
      path: 'transaction',
      populate: [
        { path: 'shop', select: 'shopName shopCode address' },
        { path: 'consumerProfile', select: 'rationCardNo rationCardType headOfHouseholdName' }
      ]
    });

    if (!receipt) {
      return res.status(404).json({ success: false, error: 'Receipt not found.' });
    }

    res.json({ success: true, receipt });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRationBook,
  getConsumerDashboard,
  addFamilyMember,
  getReceiptById
};
