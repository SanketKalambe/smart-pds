const mongoose = require('mongoose');

const mockRationCardRegistrySchema = new mongoose.Schema({
  rationCardNo: { type: String, required: true, unique: true },
  cardType: { type: String, enum: ['AAY', 'BPL', 'APL'], required: true },
  headName: { type: String, required: true },
  registeredFamilySize: { type: Number, required: true, default: 4 },
  entitlementByItem: [{
    item: String,
    totalQtyKg: Number,
    pricePerKg: Number
  }]
});

module.exports = mongoose.model('MockRationCardRegistry', mockRationCardRegistrySchema);
