const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const SlotDay = require('../src/models/SlotDay');
const Shop = require('../src/models/Shop');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Slot Capacity Atomic Concurrency Test', () => {
  test('Atomic capacity guard prevents overbooking under concurrent requests', async () => {
    const shop = await Shop.create({
      shopName: 'Concurrency Test Shop',
      shopCode: 'SHOP_CONC_1',
      address: 'Test Market'
    });

    const slotDay = await SlotDay.create({
      shop: shop._id,
      date: '2026-08-01',
      timeSlot: '10:00 - 11:00',
      capacity: 1, // Only 1 spot available!
      bookedCount: 0,
      status: 'open'
    });

    // Simulate 5 simultaneous concurrent booking attempts for the 1 available spot
    const attempts = Array(5).fill(null).map(() =>
      SlotDay.findOneAndUpdate(
        {
          _id: slotDay._id,
          $expr: { $lt: ['$bookedCount', '$capacity'] }
        },
        { $inc: { bookedCount: 1 } },
        { new: true }
      )
    );

    const results = await Promise.all(attempts);
    const successfulBookings = results.filter(r => r !== null);

    expect(successfulBookings.length).toBe(1); // EXACTLY 1 succeeds!

    const finalSlotState = await SlotDay.findById(slotDay._id);
    expect(finalSlotState.bookedCount).toBe(1);
  });
});
