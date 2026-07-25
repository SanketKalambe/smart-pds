const mongoose = require('mongoose');

const slotDaySchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timeSlot: { type: String, required: true }, // e.g. "10:00 - 11:00"
  capacity: { type: Number, default: 30 },
  bookedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'full', 'closed'], default: 'open' }
}, { timestamps: true });

// Compound index to ensure uniqueness per shop, date, and time slot
slotDaySchema.index({ shop: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('SlotDay', slotDaySchema);
