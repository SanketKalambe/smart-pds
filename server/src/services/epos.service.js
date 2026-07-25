const crypto = require('crypto');

/**
 * e-POS Hardware Prototype State Machine Service
 * Mimics physical e-POS machine operations:
 * SCAN -> BIOMETRIC_VERIFY -> QUOTA_CHECK -> DISPENSE -> RECEIPT
 */

class EposStateMachine {
  /**
   * Step 1: Scan / Input Ration Card Number & pull consumer info
   */
  static async scanRationCard(rationCardNo, consumerProfileModel, familyMemberModel) {
    const consumer = await consumerProfileModel.findOne({ rationCardNo: rationCardNo.trim() })
      .populate('user', 'name email phone status')
      .populate('assignedShopId', 'shopName shopCode address');

    if (!consumer) {
      throw new Error(`Ration Card [${rationCardNo}] not found in Smart PDS registry.`);
    }

    if (consumer.user && consumer.user.status !== 'active' && consumer.user.status !== 'verified') {
      throw new Error(`Ration Card [${rationCardNo}] account is pending KYC approval or inactive.`);
    }

    const familyMembers = await familyMemberModel.find({ consumerProfile: consumer._id });

    return {
      step: 'SCAN_COMPLETE',
      nextStep: 'BIOMETRIC_VERIFY',
      consumer: {
        id: consumer._id,
        rationCardNo: consumer.rationCardNo,
        rationCardType: consumer.rationCardType,
        headName: consumer.headOfHouseholdName || (consumer.user ? consumer.user.name : 'Unknown'),
        address: consumer.address,
        assignedShop: consumer.assignedShopId,
        familyCount: familyMembers.length
      },
      familyMembers: familyMembers.map(m => ({
        id: m._id,
        name: m.name,
        relation: m.relation,
        aadhaarMasked: m.aadhaarMasked
      }))
    };
  }

  /**
   * Step 2: Biometric Fingerprint Check Prototype
   * Simulates matching against stored template hash
   */
  static async verifyFingerprint(consumerProfile, memberId, sampleFingerprintHash) {
    // In prototype: match provided sample or default mock hash 'FINGERPRINT_HASH_MATCH'
    const storedHash = consumerProfile.fingerprintTemplateHash || 'FINGERPRINT_MATCH_APPROVED';
    const sample = sampleFingerprintHash || 'FINGERPRINT_MATCH_APPROVED';

    const isMatch = (sample === storedHash || sample === 'FINGERPRINT_MATCH_APPROVED');

    if (!isMatch) {
      return {
        verified: false,
        step: 'BIOMETRIC_FAILED',
        message: 'Fingerprint match failed. Biometric template mismatch.'
      };
    }

    return {
      verified: true,
      step: 'BIOMETRIC_VERIFIED',
      nextStep: 'QUOTA_VERIFICATION',
      verificationId: `BIO_VER_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date()
    };
  }

  /**
   * Step 3: Quota & Entitlement Verification
   */
  static calculateEntitlement(cardType, currentMonthTransactions = []) {
    const defaultEntitlements = {
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
    };

    const base = defaultEntitlements[cardType] || defaultEntitlements['BPL'];

    // Calculate already drawn quantities this month
    const drawnMap = {};
    currentMonthTransactions.forEach(tx => {
      if (tx.itemsDistributed) {
        tx.itemsDistributed.forEach(it => {
          drawnMap[it.item] = (drawnMap[it.item] || 0) + (it.quantity || 0);
        });
      }
    });

    return base.map(ent => {
      const drawn = drawnMap[ent.item] || 0;
      const remaining = Math.max(0, ent.totalQtyKg - drawn);
      return {
        item: ent.item,
        totalQty: ent.totalQtyKg,
        drawnQty: drawn,
        remainingQty: remaining,
        pricePerKg: ent.pricePerKg,
        unit: ent.unit
      };
    });
  }

  /**
   * Step 4: Dispense Ration
   */
  static dispenseRation(selectedItems, entitlementList) {
    let totalCost = 0;
    const dispensedItems = [];

    for (const reqItem of selectedItems) {
      const ent = entitlementList.find(e => e.item === reqItem.item);
      if (!ent) {
        throw new Error(`Item ${reqItem.item} is not part of this ration entitlement.`);
      }

      if (reqItem.quantity > ent.remainingQty) {
        throw new Error(`Requested ${reqItem.quantity} ${ent.unit} of ${reqItem.item} exceeds monthly balance of ${ent.remainingQty} ${ent.unit}.`);
      }

      const cost = Number((reqItem.quantity * ent.pricePerKg).toFixed(2));
      totalCost += cost;

      dispensedItems.push({
        item: reqItem.item,
        quantity: reqItem.quantity,
        pricePerKg: ent.pricePerKg,
        cost,
        unit: ent.unit
      });
    }

    return {
      step: 'DISPENSED',
      nextStep: 'PAYMENT_AND_RECEIPT',
      dispensedItems,
      totalAmount: Number(totalCost.toFixed(2)),
      dispenseTimestamp: new Date()
    };
  }
}

module.exports = EposStateMachine;
