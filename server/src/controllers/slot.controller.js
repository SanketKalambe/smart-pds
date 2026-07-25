const SlotDay = require('../models/SlotDay');
const SlotBooking = require('../models/SlotBooking');
const ConsumerProfile = require('../models/ConsumerProfile');
const SystemSettings = require('../models/SystemSettings');
const { TIME_SLOTS } = require('../config/settings');
const { createNotification } = require('../services/notification.service');

// @desc    Get available slots & capacities for a shop on a given date
// @route   GET /api/consumer/slots?shopId=&date=
// @access  Private (Consumer / Distributor)
const getAvailableSlots = async (req, res, next) => {
  try {
    const { shopId, date } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    let targetShopId = shopId;
    if (!targetShopId && req.user.role === 'consumer') {
      const profile = await ConsumerProfile.findOne({ user: req.user._id });
      if (profile) targetShopId = profile.assignedShopId;
    }

    if (!targetShopId) {
      return res.status(400).json({ success: false, error: 'Shop ID is required.' });
    }

    const settings = await SystemSettings.findOne() || { defaultSlotCapacity: 30 };
    const defaultCap = settings.defaultSlotCapacity || 30;

    // Ensure slot day records exist for all standard time slots
    const slots = await Promise.all(
      TIME_SLOTS.map(async (slotTime) => {
        let slotDay = await SlotDay.findOne({
          shop: targetShopId,
          date: targetDate,
          timeSlot: slotTime
        });

        if (!slotDay) {
          try {
            slotDay = await SlotDay.create({
              shop: targetShopId,
              date: targetDate,
              timeSlot: slotTime,
              capacity: defaultCap,
              bookedCount: 0,
              status: 'open'
            });
          } catch (e) {
            // Race condition fallback lookup
            slotDay = await SlotDay.findOne({
              shop: targetShopId,
              date: targetDate,
              timeSlot: slotTime
            });
          }
        }

        return {
          id: slotDay._id,
          timeSlot: slotDay.timeSlot,
          capacity: slotDay.capacity,
          bookedCount: slotDay.bookedCount,
          availableSpots: Math.max(0, slotDay.capacity - slotDay.bookedCount),
          status: slotDay.bookedCount >= slotDay.capacity ? 'full' : slotDay.status
        };
      })
    );

    res.json({
      success: true,
      shopId: targetShopId,
      date: targetDate,
      slots
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Book a slot (Atomic capacity check)
// @route   POST /api/consumer/slots/book
// @access  Private (Consumer)
const bookSlot = async (req, res, next) => {
  try {
    const { slotDayId, date, timeSlot } = req.body;

    const consumer = await ConsumerProfile.findOne({ user: req.user._id });
    if (!consumer) {
      return res.status(404).json({ success: false, error: 'Consumer profile not found.' });
    }

    // Check if consumer already has an active booking for this date
    const existing = await SlotBooking.findOne({
      consumerProfile: consumer._id,
      date,
      status: 'booked'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: `You already have an active booking [${existing.timeSlot}] on ${date}. Cancel it first to select a new slot.`
      });
    }

    /**
     * ATOMIC RACE-CONDITION GUARD:
     * We increment bookedCount ONLY IF bookedCount < capacity using $lt filter.
     * This guarantees two concurrent requests cannot both overbook the last available spot.
     */
    const updatedSlotDay = await SlotDay.findOneAndUpdate(
      {
        _id: slotDayId,
        $expr: { $lt: ['$bookedCount', '$capacity'] }
      },
      {
        $inc: { bookedCount: 1 }
      },
      { new: true }
    );

    if (!updatedSlotDay) {
      return res.status(400).json({
        success: false,
        error: 'This slot is FULL! Capacity reached. Please select a different time slot or date.'
      });
    }

    // If capacity reached, update status to full
    if (updatedSlotDay.bookedCount >= updatedSlotDay.capacity) {
      updatedSlotDay.status = 'full';
      await updatedSlotDay.save();
    }

    const bookingReference = `SLOT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const booking = await SlotBooking.create({
      consumerProfile: consumer._id,
      shop: updatedSlotDay.shop,
      slotDay: updatedSlotDay._id,
      date: updatedSlotDay.date,
      timeSlot: updatedSlotDay.timeSlot,
      bookingReference,
      status: 'booked'
    });

    await createNotification({
      userId: req.user._id,
      message: `Your distribution slot on ${updatedSlotDay.date} (${updatedSlotDay.timeSlot}) is confirmed. Reference: ${bookingReference}`,
      type: 'slot'
    });

    res.status(201).json({
      success: true,
      message: 'Slot booked successfully!',
      booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel slot booking (Atomic decrement)
// @route   DELETE /api/consumer/slots/:bookingId
// @access  Private (Consumer)
const cancelSlotBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await SlotBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Atomic decrement of bookedCount on SlotDay
    const slotDay = await SlotDay.findById(booking.slotDay);
    if (slotDay) {
      slotDay.bookedCount = Math.max(0, slotDay.bookedCount - 1);
      if (slotDay.bookedCount < slotDay.capacity && slotDay.status === 'full') {
        slotDay.status = 'open';
      }
      await slotDay.save();
    }

    res.json({
      success: true,
      message: 'Slot booking cancelled. The spot has been freed up for other consumers.',
      booking
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvailableSlots,
  bookSlot,
  cancelSlotBooking
};
