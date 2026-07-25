const mongoose = require('mongoose');

const mockGovtDistributorRegistrySchema = new mongoose.Schema({
  distributorGovtId: { type: String, required: true, unique: true },
  expectedName: { type: String, required: true },
  shopName: { type: String, required: true },
  area: { type: String, required: true },
  district: { type: String, default: 'North District' },
  state: { type: String, default: 'State Central' }
});

module.exports = mongoose.model('MockGovtDistributorRegistry', mockGovtDistributorRegistrySchema);
