const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  getRationBook,
  getConsumerDashboard,
  addFamilyMember,
  getReceiptById
} = require('../controllers/consumer.controller');

router.use(protect, requireRole('consumer'));

router.get('/ration-book', getRationBook);
router.get('/dashboard', getConsumerDashboard);
router.patch('/family-members', addFamilyMember);
router.get('/receipts/:id', getReceiptById);

module.exports = router;
