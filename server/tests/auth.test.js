const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../src/models/User');
const MockGovtDistributorRegistry = require('../src/models/MockGovtDistributorRegistry');
const MockRationCardRegistry = require('../src/models/MockRationCardRegistry');
const { encrypt, decrypt, maskAadhaar } = require('../src/services/encryption.service');

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

describe('Security & Auth Tests', () => {
  test('AES-256 Encryption & Masking Helper', () => {
    const rawAadhaar = '123456789012';
    const encrypted = encrypt(rawAadhaar);
    expect(encrypted).toContain(':');

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(rawAadhaar);

    const masked = maskAadhaar(rawAadhaar);
    expect(masked).toBe('XXXX XXXX 9012');
  });

  test('Distributor Registration with Format Validation Failure', async () => {
    const res = await request(app)
      .post('/api/auth/distributor/register')
      .send({
        name: 'Test Distributor',
        email: 'bad_aadhaar@example.com',
        password: 'password123',
        phone: '9876543210',
        distributorGovtId: 'DIS123456',
        aadhaarNumber: '123', // INVALID 3 digits
        shopName: 'Test Shop',
        shopAddress: 'Address 1'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation failed');
  });
});
