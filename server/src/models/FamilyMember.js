const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  consumerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsumerProfile', required: true },
  name: { type: String, required: true, trim: true },
  relation: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  aadhaarEncrypted: { type: String, required: true },
  aadhaarMasked: { type: String, required: true },
  photoUrl: { type: String },
  isMinor: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
