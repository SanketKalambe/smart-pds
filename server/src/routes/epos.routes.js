const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  scanCard,
  verifyFingerprint,
  dispenseRation,
  generateReceipt
} = require('../controllers/epos.controller');

router.use(protect, requireRole('distributor'));

router.post('/scan', scanCard);
router.post('/verify', verifyFingerprint);
router.post('/dispense', dispenseRation);
router.post('/receipt', generateReceipt);

module.exports = router;
