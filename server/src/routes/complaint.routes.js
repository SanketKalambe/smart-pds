const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const {
  suggestComplaintCategory,
  fileComplaint,
  getConsumerComplaints,
  getAllComplaints,
  updateComplaintStatus
} = require('../controllers/complaint.controller');

router.use(protect);

// Consumer endpoints
router.post('/complaints/suggest', requireRole('consumer'), suggestComplaintCategory);
router.post('/complaints', requireRole('consumer'), upload.array('media', 3), fileComplaint);
router.get('/complaints', requireRole('consumer'), getConsumerComplaints);

// Admin endpoints
router.get('/admin/complaints', requireRole('admin'), getAllComplaints);
router.patch('/admin/complaints/:id', requireRole('admin'), updateComplaintStatus);

module.exports = router;
