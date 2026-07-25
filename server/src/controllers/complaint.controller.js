const Complaint = require('../models/Complaint');
const ConsumerProfile = require('../models/ConsumerProfile');
const { analyzeComplaintText } = require('../services/complaintSuggestion.service');
const { uploadMedia } = require('../services/cloudinary.service');
const { createNotification } = require('../services/notification.service');

// @desc    Live typing auto-suggestion
// @route   POST /api/consumer/complaints/suggest
// @access  Private (Consumer)
const suggestComplaintCategory = async (req, res) => {
  const { text, subject } = req.body;
  const suggestion = analyzeComplaintText(text || '', subject || '');
  res.json({ success: true, suggestion });
};

// @desc    File a new complaint
// @route   POST /api/consumer/complaints
// @access  Private (Consumer)
const fileComplaint = async (req, res, next) => {
  try {
    const { subject, description, shopId } = req.body;

    const consumer = await ConsumerProfile.findOne({ user: req.user._id });
    if (!consumer) {
      return res.status(404).json({ success: false, error: 'Consumer profile not found.' });
    }

    // Auto-analyze text for category & resolution suggestions
    const suggestion = analyzeComplaintText(description, subject);

    // Handle media uploads via Cloudinary
    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadMedia(file.buffer, 'smart-pds/complaints');
        if (uploadResult && uploadResult.url) {
          mediaUrls.push(uploadResult.url);
        }
      }
    }

    const complaint = await Complaint.create({
      consumerProfile: consumer._id,
      shop: shopId || consumer.assignedShopId,
      subject,
      description,
      mediaUrls,
      suggestedCategory: suggestion.category,
      suggestedResolution: suggestion.resolution,
      status: 'open'
    });

    await createNotification({
      userId: req.user._id,
      message: `Your complaint [${subject}] has been registered under category: ${suggestion.category}.`,
      type: 'complaint'
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get consumer's complaints list
// @route   GET /api/consumer/complaints
// @access  Private (Consumer)
const getConsumerComplaints = async (req, res, next) => {
  try {
    const consumer = await ConsumerProfile.findOne({ user: req.user._id });
    if (!consumer) {
      return res.status(404).json({ success: false, error: 'Consumer profile not found.' });
    }

    const complaints = await Complaint.find({ consumerProfile: consumer._id })
      .populate('shop', 'shopName shopCode')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all complaints (Admin view)
// @route   GET /api/admin/complaints
// @access  Private (Admin)
const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate({
        path: 'consumerProfile',
        populate: { path: 'user', select: 'name phone email' }
      })
      .populate('shop', 'shopName shopCode')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    next(err);
  }
};

// @desc    Update complaint status & resolution (Admin action)
// @route   PATCH /api/admin/complaints/:id
// @access  Private (Admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body; // status: 'open' | 'in-progress' | 'resolved'

    const complaint = await Complaint.findById(id).populate({
      path: 'consumerProfile',
      populate: { path: 'user' }
    });

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    if (status) complaint.status = status;
    if (adminNotes) complaint.adminNotes = adminNotes;

    await complaint.save();

    if (complaint.consumerProfile && complaint.consumerProfile.user) {
      await createNotification({
        userId: complaint.consumerProfile.user._id,
        message: `Your complaint [${complaint.subject}] status has been updated to: ${status.toUpperCase()}.`,
        type: 'complaint'
      });
    }

    res.json({ success: true, message: 'Complaint status updated.', complaint });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  suggestComplaintCategory,
  fileComplaint,
  getConsumerComplaints,
  getAllComplaints,
  updateComplaintStatus
};
