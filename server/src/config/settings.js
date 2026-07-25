module.exports = {
  DEFAULT_HELPLINE_NUMBER: '1800-11-1967',
  DEFAULT_SLOT_CAPACITY: 30,
  TIME_SLOTS: [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00'
  ],
  RATION_ENTITLEMENTS: {
    AAY: [
      { item: 'Rice', totalQtyKg: 35, pricePerKg: 0, unit: 'kg' },
      { item: 'Wheat', totalQtyKg: 10, pricePerKg: 0, unit: 'kg' },
      { item: 'Sugar', totalQtyKg: 2, pricePerKg: 13.5, unit: 'kg' },
      { item: 'Kerosene', totalQtyKg: 3, pricePerKg: 25, unit: 'L' }
    ],
    BPL: [
      { item: 'Rice', totalQtyKg: 25, pricePerKg: 3, unit: 'kg' },
      { item: 'Wheat', totalQtyKg: 10, pricePerKg: 2, unit: 'kg' },
      { item: 'Sugar', totalQtyKg: 1, pricePerKg: 13.5, unit: 'kg' }
    ],
    APL: [
      { item: 'Rice', totalQtyKg: 15, pricePerKg: 8.3, unit: 'kg' },
      { item: 'Wheat', totalQtyKg: 10, pricePerKg: 6.1, unit: 'kg' }
    ]
  }
};
