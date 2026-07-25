const MockGovtDistributorRegistry = require('../models/MockGovtDistributorRegistry');
const MockRationCardRegistry = require('../models/MockRationCardRegistry');

/**
 * Simulates government verification of Distributor Govt ID against Mock registry
 */
const verifyDistributorGovtId = async (distributorGovtId, aadhaarNumber) => {
  try {
    const record = await MockGovtDistributorRegistry.findOne({ distributorGovtId });
    if (!record) {
      return {
        matched: false,
        reason: 'Distributor Govt ID not found in government database registry'
      };
    }

    return {
      matched: true,
      data: {
        expectedName: record.expectedName,
        area: record.area,
        shopName: record.shopName,
        district: record.district,
        state: record.state
      }
    };
  } catch (err) {
    console.error('Error in distributor KYC mock check:', err.message);
    return { matched: false, reason: 'Database check failed' };
  }
};

/**
 * Simulates government verification of Ration Card ID against Mock registry
 */
const verifyRationCardNo = async (rationCardNo) => {
  try {
    const record = await MockRationCardRegistry.findOne({ rationCardNo });
    if (!record) {
      return {
        matched: false,
        reason: 'Ration Card ID not found in official PDS registry'
      };
    }

    return {
      matched: true,
      data: {
        cardType: record.cardType,
        headName: record.headName,
        registeredFamilySize: record.registeredFamilySize,
        entitlementByItem: record.entitlementByItem
      }
    };
  } catch (err) {
    console.error('Error in ration card KYC mock check:', err.message);
    return { matched: false, reason: 'Database check failed' };
  }
};

module.exports = {
  verifyDistributorGovtId,
  verifyRationCardNo
};
