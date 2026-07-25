const mongoose = require('mongoose');

const stockAllocationSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  monthYear: { type: String, required: true }, // e.g. "2026-07"
  item: { type: String, required: true },
  quantityAllocatedKg: { type: Number, required: true },
  quantityReceivedKg: { type: Number, default: 0 },
  status: { type: String, enum: ['allocated', 'received', 'partially_received'], default: 'allocated' },
  allocatedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('StockAllocation', stockAllocationSchema);
