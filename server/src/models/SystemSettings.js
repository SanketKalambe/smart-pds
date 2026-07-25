const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  helplineNumber: { type: String, default: '1800-11-1967' },
  defaultSlotCapacity: { type: Number, default: 30 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
