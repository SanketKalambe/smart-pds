const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('../src/config/db');

dotenv.config({ path: '../.env' });

const User = require('../src/models/User');
const DistributorProfile = require('../src/models/DistributorProfile');
const ConsumerProfile = require('../src/models/ConsumerProfile');
const FamilyMember = require('../src/models/FamilyMember');
const Shop = require('../src/models/Shop');
const StockAllocation = require('../src/models/StockAllocation');
const Transaction = require('../src/models/Transaction');
const SlotDay = require('../src/models/SlotDay');
const SlotBooking = require('../src/models/SlotBooking');
const Complaint = require('../src/models/Complaint');
const SystemSettings = require('../src/models/SystemSettings');
const MockGovtDistributorRegistry = require('../src/models/MockGovtDistributorRegistry');
const MockRationCardRegistry = require('../src/models/MockRationCardRegistry');
const { encrypt, maskAadhaar } = require('../src/services/encryption.service');
const { TIME_SLOTS } = require('../src/config/settings');

const seedData = async (exitProcess = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rationsetu');
    }

    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await DistributorProfile.deleteMany({});
    await ConsumerProfile.deleteMany({});
    await FamilyMember.deleteMany({});
    await Shop.deleteMany({});
    await StockAllocation.deleteMany({});
    await Transaction.deleteMany({});
    await SlotDay.deleteMany({});
    await SlotBooking.deleteMany({});
    await Complaint.deleteMany({});
    await SystemSettings.deleteMany({});
    await MockGovtDistributorRegistry.deleteMany({});
    await MockRationCardRegistry.deleteMany({});

    console.log('Seeding Mock Government Registries...');
    await MockGovtDistributorRegistry.create([
      {
        distributorGovtId: 'DIS998877',
        expectedName: 'Rajesh Sharma',
        shopName: 'Janata Fair Price Shop #42',
        area: 'Ward 12 - North Zone',
        district: 'Central District',
        state: 'Delhi'
      },
      {
        distributorGovtId: 'DIS112233',
        expectedName: 'Sunita Verma',
        shopName: 'Gramin Ration Kendra #108',
        area: 'Sector 4 - South Zone',
        district: 'South District',
        state: 'Delhi'
      }
    ]);

    await MockRationCardRegistry.create([
      {
        rationCardNo: 'RC100200300',
        cardType: 'AAY',
        headName: 'Ramesh Kumar',
        registeredFamilySize: 4,
        entitlementByItem: [
          { item: 'Rice', totalQtyKg: 35, pricePerKg: 0 },
          { item: 'Wheat', totalQtyKg: 10, pricePerKg: 0 }
        ]
      },
      {
        rationCardNo: 'RC400500600',
        cardType: 'BPL',
        headName: 'Anita Devi',
        registeredFamilySize: 3,
        entitlementByItem: [
          { item: 'Rice', totalQtyKg: 25, pricePerKg: 3 },
          { item: 'Wheat', totalQtyKg: 10, pricePerKg: 2 }
        ]
      }
    ]);

    console.log('Seeding System Settings...');
    await SystemSettings.create({
      helplineNumber: '1800-11-1967',
      defaultSlotCapacity: 30
    });

    console.log('Seeding Government Admin...');
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const adminUser = await User.create({
      name: 'Central PDS Administrator',
      email: 'admin@rationsetu.gov.in',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '9876543210',
      phoneVerified: true,
      status: 'active'
    });

    console.log('Seeding Shop & Distributor...');
    const distPasswordHash = await bcrypt.hash('Distributor@123', 10);
    const distUser = await User.create({
      name: 'Rajesh Sharma',
      email: 'distributor@example.com',
      passwordHash: distPasswordHash,
      role: 'distributor',
      phone: '9811223344',
      phoneVerified: true,
      status: 'active'
    });

    const shop = await Shop.create({
      shopName: 'Janata Fair Price Shop #42',
      shopCode: 'DIS998877',
      distributorUser: distUser._id,
      address: 'Shop No. 12, Main Market Road, Civil Lines',
      wardDistrict: 'Ward 12 - North Zone',
      stockAvailability: [
        { item: 'Rice', quantityKg: 500, unit: 'kg' },
        { item: 'Wheat', quantityKg: 350, unit: 'kg' },
        { item: 'Sugar', quantityKg: 100, unit: 'kg' },
        { item: 'Kerosene', quantityKg: 80, unit: 'L' }
      ]
    });

    await DistributorProfile.create({
      user: distUser._id,
      distributorGovtId: 'DIS998877',
      distributorGovtIdVerified: true,
      aadhaarEncrypted: encrypt('123456789012'),
      aadhaarMasked: maskAadhaar('123456789012'),
      shopId: shop._id,
      areaWard: 'Ward 12 - North Zone'
    });

    await StockAllocation.create({
      shop: shop._id,
      monthYear: new Date().toISOString().slice(0, 7),
      item: 'Rice',
      quantityAllocatedKg: 500,
      quantityReceivedKg: 500,
      status: 'received',
      allocatedByAdmin: adminUser._id
    });

    console.log('Seeding Consumer & Family Members...');
    const consPasswordHash = await bcrypt.hash('Consumer@123', 10);
    const consUser = await User.create({
      name: 'Ramesh Kumar',
      email: 'consumer@example.com',
      passwordHash: consPasswordHash,
      role: 'consumer',
      phone: '9988776655',
      phoneVerified: true,
      status: 'active'
    });

    const consumerProfile = await ConsumerProfile.create({
      user: consUser._id,
      rationCardNo: 'RC100200300',
      rationCardType: 'AAY',
      rationCardVerified: true,
      address: 'H.No. 45, Gali No. 3, North Block',
      assignedShopId: shop._id,
      headOfHouseholdName: 'Ramesh Kumar'
    });

    await FamilyMember.create([
      {
        consumerProfile: consumerProfile._id,
        name: 'Ramesh Kumar',
        relation: 'Self (Head)',
        dateOfBirth: new Date('1980-05-15'),
        aadhaarEncrypted: encrypt('987654321098'),
        aadhaarMasked: maskAadhaar('987654321098'),
        isMinor: false
      },
      {
        consumerProfile: consumerProfile._id,
        name: 'Sunita Devi',
        relation: 'Wife',
        dateOfBirth: new Date('1984-08-20'),
        aadhaarEncrypted: encrypt('987654321099'),
        aadhaarMasked: maskAadhaar('987654321099'),
        isMinor: false
      },
      {
        consumerProfile: consumerProfile._id,
        name: 'Aarav Kumar',
        relation: 'Son',
        dateOfBirth: new Date('2012-11-10'),
        aadhaarEncrypted: encrypt('987654321100'),
        aadhaarMasked: maskAadhaar('987654321100'),
        isMinor: true
      }
    ]);

    console.log('Seeding Slots for Today...');
    const todayStr = new Date().toISOString().slice(0, 10);

    const createdSlotDays = [];
    for (const timeSlot of TIME_SLOTS) {
      const slot = await SlotDay.create({
        shop: shop._id,
        date: todayStr,
        timeSlot,
        capacity: 30,
        bookedCount: timeSlot === '10:00 - 11:00' ? 1 : 0,
        status: 'open'
      });
      createdSlotDays.push(slot);
    }

    const targetSlotDay = createdSlotDays.find(s => s.timeSlot === '10:00 - 11:00');
    await SlotBooking.create({
      consumerProfile: consumerProfile._id,
      shop: shop._id,
      slotDay: targetSlotDay._id,
      date: todayStr,
      timeSlot: '10:00 - 11:00',
      bookingReference: 'SLOT-DEMO-1001',
      status: 'booked'
    });

    console.log('Seeding Sample Transaction & Complaint...');
    await Transaction.create({
      consumerProfile: consumerProfile._id,
      shop: shop._id,
      itemsDistributed: [
        { item: 'Rice', quantity: 15, unit: 'kg', pricePerKg: 0, cost: 0 },
        { item: 'Wheat', quantity: 5, unit: 'kg', pricePerKg: 0, cost: 0 }
      ],
      totalAmount: 0,
      paymentStatus: 'completed',
      biometricVerified: true,
      verificationLog: 'BIO_VER_MOCK_INITIAL',
      monthYear: new Date().toISOString().slice(0, 7)
    });

    await Complaint.create({
      consumerProfile: consumerProfile._id,
      shop: shop._id,
      subject: 'Rice bag quality was damp',
      description: 'The rice distributed in yesterday slot was slightly wet near the top corner.',
      suggestedCategory: 'Poor Quality / Damaged Stock',
      suggestedResolution: 'Replacement stock will be issued upon depot inspection.',
      status: 'open'
    });

    console.log('====================================================');
    console.log('  SMART PDS DATABASE SEEDED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('  Admin Login       : admin@rationsetu.gov.in / Admin@123');
    console.log('  Distributor Login : distributor@example.com / Distributor@123');
    console.log('  Consumer Login    : consumer@example.com / Consumer@123');
    console.log('====================================================');

    if (exitProcess) process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    if (exitProcess) process.exit(1);
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData };
