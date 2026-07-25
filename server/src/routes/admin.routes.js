const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  getVerificationQueue,
  updateVerificationStatus,
  allocateStock,
  updateSettings,
  getAdminReports,
  getAllConsumers,
  getAllDistributors
} = require('../controllers/admin.controller');

router.use(protect, requireRole('admin'));

router.get('/verification-queue', getVerificationQueue);
router.patch('/verification-queue/:userId', updateVerificationStatus);
router.get('/consumers', getAllConsumers);
router.get('/distributors', getAllDistributors);
router.post('/stock-allocation', allocateStock);
router.put('/settings', updateSettings);
router.get('/reports', getAdminReports);

module.exports = router;
