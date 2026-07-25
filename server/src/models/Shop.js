const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true, trim: true },
  shopCode: { type: String, required: true, unique: true, trim: true },
  distributorUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: { type: String, required: true },
  wardDistrict: { type: String, default: 'District North' },
  stockAvailability: [{
    item: { type: String, required: true },
    quantityKg: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
