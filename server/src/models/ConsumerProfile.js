const mongoose = require('mongoose');

const consumerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rationCardNo: { type: String, required: true, unique: true, trim: true },
  rationCardType: { type: String, enum: ['AAY', 'BPL', 'APL'], default: 'BPL' },
  rationCardVerified: { type: Boolean, default: false },
  address: { type: String, required: true },
  assignedShopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  headOfHouseholdName: { type: String, required: true },
  fingerprintTemplateHash: { type: String, default: 'FINGERPRINT_MATCH_APPROVED' }
}, { timestamps: true });

module.exports = mongoose.model('ConsumerProfile', consumerProfileSchema);
