const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  getAvailableSlots,
  bookSlot,
  cancelSlotBooking
} = require('../controllers/slot.controller');

router.use(protect);

router.get('/slots', getAvailableSlots);
router.post('/slots/book', requireRole('consumer'), bookSlot);
router.delete('/slots/:bookingId', requireRole('consumer'), cancelSlotBooking);

module.exports = router;
