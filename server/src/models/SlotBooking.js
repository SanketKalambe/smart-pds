const mongoose = require('mongoose');

const slotBookingSchema = new mongoose.Schema({
  consumerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsumerProfile', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  slotDay: { type: mongoose.Schema.Types.ObjectId, ref: 'SlotDay', required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  bookingReference: { type: String, required: true, unique: true },
  status: { type: String, enum: ['booked', 'completed', 'cancelled', 'no-show'], default: 'booked' }
}, { timestamps: true });

module.exports = mongoose.model('SlotBooking', slotBookingSchema);
