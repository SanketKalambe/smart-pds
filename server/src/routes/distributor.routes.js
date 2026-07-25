const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  getStock,
  updateStock,
  getTodaySlots
} = require('../controllers/distributor.controller');

router.use(protect, requireRole('distributor'));

router.get('/stock', getStock);
router.patch('/stock', updateStock);
router.get('/slots', getTodaySlots);

module.exports = router;
