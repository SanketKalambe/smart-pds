const mongoose = require('mongoose');

const distributorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  distributorGovtId: { type: String, required: true, trim: true },
  distributorGovtIdVerified: { type: Boolean, default: false },
  aadhaarEncrypted: { type: String, required: true },
  aadhaarMasked: { type: String, required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  idDocumentUrls: [{ type: String }],
  fingerprintTemplateHash: { type: String, default: 'FINGERPRINT_MATCH_APPROVED' },
  areaWard: { type: String, default: 'Ward 12' }
}, { timestamps: true });

module.exports = mongoose.model('DistributorProfile', distributorProfileSchema);
