const DistributorProfile = require('../models/DistributorProfile');
const Shop = require('../models/Shop');
const SlotBooking = require('../models/SlotBooking');
const Transaction = require('../models/Transaction');

// @desc    Get distributor's assigned shop & stock availability
// @route   GET /api/distributor/stock
// @access  Private (Distributor)
const getStock = async (req, res, next) => {
  try {
    const profile = await DistributorProfile.findOne({ user: req.user._id }).populate('shopId');
    if (!profile || !profile.shopId) {
      return res.status(404).json({ success: false, error: 'No shop associated with this distributor account.' });
    }

    res.json({
      success: true,
      shop: profile.shopId,
      stockAvailability: profile.shopId.stockAvailability
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update stock availability manually
// @route   PATCH /api/distributor/stock
// @access  Private (Distributor)
const updateStock = async (req, res, next) => {
  try {
    const { items } = req.body; // array of { item, quantityKg }
    const profile = await DistributorProfile.findOne({ user: req.user._id });
    if (!profile || !profile.shopId) {
      return res.status(404).json({ success: false, error: 'Shop profile not found.' });
    }

    const shop = await Shop.findById(profile.shopId);
    if (!shop) {
      return res.status(404).json({ success: false, error: 'Shop document not found.' });
    }

    items.forEach(reqItem => {
      let existing = shop.stockAvailability.find(s => s.item === reqItem.item);
      if (existing) {
        existing.quantityKg = Number(reqItem.quantityKg);
      } else {
        shop.stockAvailability.push({ item: reqItem.item, quantityKg: Number(reqItem.quantityKg), unit: 'kg' });
      }
    });

    await shop.save();

    res.json({
      success: true,
      message: 'Stock updated successfully.',
      stockAvailability: shop.stockAvailability
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get expected slot bookings for a date
// @route   GET /api/distributor/slots?date=YYYY-MM-DD
// @access  Private (Distributor)
const getTodaySlots = async (req, res, next) => {
  try {
    const profile = await DistributorProfile.findOne({ user: req.user._id });
    if (!profile || !profile.shopId) {
      return res.status(404).json({ success: false, error: 'Shop profile not found.' });
    }

    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);

    const bookings = await SlotBooking.find({
      shop: profile.shopId,
      date: dateStr,
      status: { $ne: 'cancelled' }
    }).populate({
      path: 'consumerProfile',
      populate: { path: 'user', select: 'name phone' }
    });

    const formattedBookings = bookings.map(b => ({
      bookingId: b._id,
      bookingReference: b.bookingReference,
      rationCardNo: b.consumerProfile ? b.consumerProfile.rationCardNo : 'N/A',
      consumerName: b.consumerProfile ? (b.consumerProfile.headOfHouseholdName || b.consumerProfile.user.name) : 'Consumer',
      phone: b.consumerProfile && b.consumerProfile.user ? b.consumerProfile.user.phone : 'N/A',
      cardType: b.consumerProfile ? b.consumerProfile.rationCardType : 'BPL',
      timeSlot: b.timeSlot,
      status: b.status
    }));

    res.json({
      success: true,
      date: dateStr,
      totalBooked: formattedBookings.length,
      bookings: formattedBookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Distributor Dashboard summary
// @route   GET /api/distributor/dashboard
// @access  Private (Distributor)
const getDistributorDashboard = async (req, res, next) => {
  try {
    const profile = await DistributorProfile.findOne({ user: req.user._id }).populate('shopId');
    if (!profile || !profile.shopId) {
      return res.status(404).json({ success: false, error: 'Shop profile not found for distributor.' });
    }

    const shop = profile.shopId;
    const dateStr = new Date().toISOString().slice(0, 10);

    const todaySlotCount = await SlotBooking.countDocuments({
      shop: shop._id,
      date: dateStr,
      status: { $ne: 'cancelled' }
    });

    const monthlyDistributionCount = await Transaction.countDocuments({
      shop: shop._id,
      status: 'completed'
    });

    const stockSummary = shop.stockAvailability || [];

    res.json({
      success: true,
      shop: {
        _id: shop._id,
        shopName: shop.shopName,
        shopCode: shop.shopCode,
        address: shop.address,
        wardDistrict: shop.wardDistrict
      },
      stockSummary,
      todaySlotCount,
      monthlyDistributionCount
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStock,
  updateStock,
  getTodaySlots,
  getDistributorDashboard
};
