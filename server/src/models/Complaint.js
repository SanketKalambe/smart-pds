const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  consumerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsumerProfile', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  mediaUrls: [{ type: String }],
  suggestedCategory: { type: String, default: 'General PDS Grievance' },
  suggestedResolution: { type: String },
  adminNotes: { type: String },
  status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
