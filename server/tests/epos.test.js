const EposStateMachine = require('../src/services/epos.service');

describe('e-POS State Machine Unit Tests', () => {
  test('Calculate entitlement correctly for AAY card', () => {
    const entitlements = EposStateMachine.calculateEntitlement('AAY', []);
    const rice = entitlements.find(e => e.item === 'Rice');
    expect(rice.totalQty).toBe(35);
    expect(rice.remainingQty).toBe(35);
    expect(rice.pricePerKg).toBe(0);
  });

  test('Calculate remaining entitlement when partial transactions exist', () => {
    const mockTx = [
      {
        itemsDistributed: [
          { item: 'Rice', quantity: 20 }
        ]
      }
    ];

    const entitlements = EposStateMachine.calculateEntitlement('AAY', mockTx);
    const rice = entitlements.find(e => e.item === 'Rice');
    expect(rice.drawnQty).toBe(20);
    expect(rice.remainingQty).toBe(15);
  });

  test('Dispense ration rejects quantity exceeding remaining entitlement', () => {
    const entitlementList = [
      { item: 'Rice', remainingQty: 10, pricePerKg: 3, unit: 'kg' }
    ];

    expect(() => {
      EposStateMachine.dispenseRation([{ item: 'Rice', quantity: 15 }], entitlementList);
    }).toThrow(/exceeds monthly balance/);
  });

  test('Dispense ration calculates total cost accurately', () => {
    const entitlementList = [
      { item: 'Wheat', remainingQty: 10, pricePerKg: 2, unit: 'kg' }
    ];

    const result = EposStateMachine.dispenseRation([{ item: 'Wheat', quantity: 5 }], entitlementList);
    expect(result.totalAmount).toBe(10);
    expect(result.dispensedItems[0].cost).toBe(10);
  });
});
