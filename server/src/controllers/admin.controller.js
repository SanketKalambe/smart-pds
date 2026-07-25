const User = require('../models/User');
const DistributorProfile = require('../models/DistributorProfile');
const ConsumerProfile = require('../models/ConsumerProfile');
const FamilyMember = require('../models/FamilyMember');
const Shop = require('../models/Shop');
const StockAllocation = require('../models/StockAllocation');
const SystemSettings = require('../models/SystemSettings');
const Complaint = require('../models/Complaint');
const Transaction = require('../models/Transaction');
const SlotBooking = require('../models/SlotBooking');
const { createNotification } = require('../services/notification.service');

// @desc    Get pending distributor & consumer KYC verification queue
// @route   GET /api/admin/verification-queue
// @access  Private (Admin)
const getVerificationQueue = async (req, res, next) => {
  try {
    const pendingDistributors = await DistributorProfile.find()
      .populate({
        path: 'user',
        match: { status: { $in: ['pending', 'verified'] } }
      })
      .populate('shopId');

    const pendingConsumers = await ConsumerProfile.find()
      .populate({
        path: 'user',
        match: { status: { $in: ['pending', 'verified'] } }
      })
      .populate('assignedShopId');

    // Filter out items where user populate returned null
    const distributorsList = pendingDistributors
      .filter(d => d.user)
      .map(d => ({
        type: 'distributor',
        profileId: d._id,
        userId: d.user._id,
        name: d.user.name,
        email: d.user.email,
        phone: d.user.phone,
        status: d.user.status,
        distributorGovtId: d.distributorGovtId,
        distributorGovtIdVerified: d.distributorGovtIdVerified,
        aadhaarMasked: d.aadhaarMasked,
        shopName: d.shopId ? d.shopId.shopName : 'N/A',
        idDocumentUrls: d.idDocumentUrls,
        createdAt: d.createdAt
      }));

    const consumersList = await Promise.all(
      pendingConsumers
        .filter(c => c.user)
        .map(async (c) => {
          const members = await FamilyMember.find({ consumerProfile: c._id });
          return {
            type: 'consumer',
            profileId: c._id,
            userId: c.user._id,
            name: c.user.name,
            email: c.user.email,
            phone: c.user.phone,
            status: c.user.status,
            rationCardNo: c.rationCardNo,
            rationCardType: c.rationCardType,
            rationCardVerified: c.rationCardVerified,
            address: c.address,
            headOfHouseholdName: c.headOfHouseholdName,
            assignedShop: c.assignedShopId ? c.assignedShopId.shopName : 'Default Shop',
            familyMembers: members.map(m => ({
              name: m.name,
              relation: m.relation,
              aadhaarMasked: m.aadhaarMasked
            })),
            createdAt: c.createdAt
          };
        })
    );

    res.json({
      success: true,
      pendingCount: distributorsList.length + consumersList.length,
      distributors: distributorsList,
      consumers: consumersList
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or Reject KYC verification
// @route   PATCH /api/admin/verification-queue/:userId
// @access  Private (Admin)
const updateVerificationStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, remarks } = req.body; // status: 'active' | 'rejected'

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be active or rejected.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    user.status = status;
    await user.save();

    await createNotification({
      userId: user._id,
      message: `Your Smart PDS account registration has been ${status.toUpperCase()}.${remarks ? ` Note: ${remarks}` : ''}`,
      type: 'kyc'
    });

    res.json({
      success: true,
      message: `User ${user.name} (${user.role}) has been ${status}.`,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Allocate monthly stock to shop
// @route   POST /api/admin/stock-allocation
// @access  Private (Admin)
const allocateStock = async (req, res, next) => {
  try {
    const { shopId, monthYear, item, quantityKg } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, error: 'Shop not found.' });
    }

    const allocation = await StockAllocation.create({
      shop: shop._id,
      monthYear: monthYear || new Date().toISOString().slice(0, 7),
      item,
      quantityAllocatedKg: Number(quantityKg),
      quantityReceivedKg: Number(quantityKg), // Auto-confirm stock in prototype
      status: 'received',
      allocatedByAdmin: req.user._id
    });

    // Update shop stock availability
    let existingItem = shop.stockAvailability.find(s => s.item === item);
    if (existingItem) {
      existingItem.quantityKg += Number(quantityKg);
    } else {
      shop.stockAvailability.push({ item, quantityKg: Number(quantityKg), unit: 'kg' });
    }
    await shop.save();

    if (shop.distributorUser) {
      await createNotification({
        userId: shop.distributorUser,
        message: `Admin allocated ${quantityKg} kg of ${item} to your shop for month ${allocation.monthYear}.`,
        type: 'stock'
      });
    }

    res.json({
      success: true,
      message: `Allocated ${quantityKg} kg of ${item} to shop [${shop.shopName}].`,
      allocation,
      shopStock: shop.stockAvailability
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update system settings (Helpline & slot capacity)
// @route   PUT /api/admin/settings
// @access  Private (Admin)
const updateSettings = async (req, res, next) => {
  try {
    const { helplineNumber, defaultSlotCapacity } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (helplineNumber) settings.helplineNumber = helplineNumber;
    if (defaultSlotCapacity) settings.defaultSlotCapacity = Number(defaultSlotCapacity);
    settings.updatedBy = req.user._id;

    await settings.save();

    res.json({
      success: true,
      message: 'System settings updated successfully.',
      settings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Admin Dashboard Analytics & Reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAdminReports = async (req, res, next) => {
  try {
    const totalConsumers = await User.countDocuments({ role: 'consumer' });
    const totalDistributors = await User.countDocuments({ role: 'distributor' });
    const pendingKycCount = await User.countDocuments({ status: 'pending' });
    const totalShops = await Shop.countDocuments();

    const totalTransactions = await Transaction.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const openComplaints = await Complaint.countDocuments({ status: 'open' });

    // Aggregate monthly distribution volume
    const distributionVolume = await Transaction.aggregate([
      { $unwind: '$itemsDistributed' },
      {
        $group: {
          _id: '$itemsDistributed.item',
          totalQuantity: { $sum: '$itemsDistributed.quantity' },
          totalRevenue: { $sum: '$itemsDistributed.cost' }
        }
      }
    ]);

    const settings = await SystemSettings.findOne() || { helplineNumber: '1800-11-1967', defaultSlotCapacity: 30 };

    res.json({
      success: true,
      stats: {
        totalConsumers,
        totalDistributors,
        pendingKycCount,
        totalShops,
        totalTransactions,
        totalComplaints,
        openComplaints,
        helplineNumber: settings.helplineNumber,
        defaultSlotCapacity: settings.defaultSlotCapacity
      },
      distributionVolume
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all consumers list
// @route   GET /api/admin/consumers
// @access  Private (Admin)
const getAllConsumers = async (req, res, next) => {
  try {
    const consumers = await ConsumerProfile.find()
      .populate('user', 'name email phone status createdAt')
      .populate('assignedShopId', 'shopName shopCode');

    const result = await Promise.all(
      consumers.map(async (c) => {
        const family = await FamilyMember.find({ consumerProfile: c._id });
        return {
          id: c._id,
          name: c.user ? c.user.name : c.headOfHouseholdName,
          email: c.user ? c.user.email : '',
          phone: c.user ? c.user.phone : '',
          status: c.user ? c.user.status : 'pending',
          rationCardNo: c.rationCardNo,
          rationCardType: c.rationCardType,
          assignedShop: c.assignedShopId ? c.assignedShopId.shopName : 'N/A',
          familyCount: family.length
        };
      })
    );

    res.json({ success: true, count: result.length, consumers: result });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all distributors list
// @route   GET /api/admin/distributors
// @access  Private (Admin)
const getAllDistributors = async (req, res, next) => {
  try {
    const distributors = await DistributorProfile.find()
      .populate('user', 'name email phone status createdAt')
      .populate('shopId');

    const result = distributors.map(d => ({
      id: d._id,
      name: d.user ? d.user.name : 'Unknown',
      email: d.user ? d.user.email : '',
      phone: d.user ? d.user.phone : '',
      status: d.user ? d.user.status : 'pending',
      distributorGovtId: d.distributorGovtId,
      aadhaarMasked: d.aadhaarMasked,
      shop: d.shopId ? {
        id: d.shopId._id,
        shopName: d.shopId.shopName,
        shopCode: d.shopId.shopCode,
        stock: d.shopId.stockAvailability
      } : null
    }));

    res.json({ success: true, count: result.length, distributors: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVerificationQueue,
  updateVerificationStatus,
  allocateStock,
  updateSettings,
  getAdminReports,
  getAllConsumers,
  getAllDistributors
};
