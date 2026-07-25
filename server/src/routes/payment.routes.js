const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { createOrder, verifyPayment } = require('../controllers/payment.controller');

router.use(protect, requireRole('distributor'));

router.post('/payment/create-order', createOrder);
router.post('/payment/verify', verifyPayment);

module.exports = router;
