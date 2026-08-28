const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DistributorProfile = require('../models/DistributorProfile');
const ConsumerProfile = require('../models/ConsumerProfile');
const FamilyMember = require('../models/FamilyMember');
const Shop = require('../models/Shop');
const { encrypt, maskAadhaar } = require('../services/encryption.service');
const { verifyDistributorGovtId, verifyRationCardNo } = require('../services/kycVerification.service');
const { generateOtp, verifyOtp } = require('../services/otp.service');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'smart_pds_jwt_secret_key_2026_super_secure', {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// @desc    Register Distributor
// @route   POST /api/auth/distributor/register
// @access  Public
const registerDistributor = async (req, res, next) => {
  try {
    const { name, email, password, phone, distributorGovtId, aadhaarNumber, shopName, shopAddress, areaWard } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists.' });
    }

    // Perform mock government KYC check
    const kycResult = await verifyDistributorGovtId(distributorGovtId, aadhaarNumber);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Initial status: if mock matched -> 'verified', else 'pending' (requires admin verification)
    const initialStatus = kycResult.matched ? 'verified' : 'pending';

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role: 'distributor',
      phone,
      phoneVerified: true,
      status: initialStatus
    });

    // Create or find shop
    let shop = await Shop.findOne({ shopCode: distributorGovtId });
    if (!shop) {
      shop = await Shop.create({
        shopName: shopName || `${name}'s Fair Price Shop`,
        shopCode: distributorGovtId,
        distributorUser: newUser._id,
        address: shopAddress || 'Main Market Road',
        wardDistrict: areaWard || 'Ward 12'
      });
    } else {
      shop.distributorUser = newUser._id;
      await shop.save();
    }

    const encryptedAadhaar = encrypt(aadhaarNumber);
    const maskedAadhaar = maskAadhaar(aadhaarNumber);

    const profile = await DistributorProfile.create({
      user: newUser._id,
      distributorGovtId,
      distributorGovtIdVerified: kycResult.matched,
      aadhaarEncrypted: encryptedAadhaar,
      aadhaarMasked: maskedAadhaar,
      shopId: shop._id,
      areaWard: areaWard || 'Ward 12',
      idDocumentUrls: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800']
    });

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      success: true,
      message: kycResult.matched 
        ? 'Distributor registered & verified against govt registry.' 
        : 'Distributor registered. Pending Admin verification queue.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        distributorGovtId,
        shopId: shop._id,
        shopName: shop.shopName
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register Consumer
// @route   POST /api/auth/consumer/register
// @access  Public
const registerConsumer = async (req, res, next) => {
  try {
    const { headOfHouseholdName, email, password, phone, rationCardNo, cardType, address, shopId, familyMembers, name } = req.body;

    const userEmail = (email || `${rationCardNo.toLowerCase()}@consumer.smartpds.gov.in`).trim();
    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists.' });
    }

    const existingCard = await ConsumerProfile.findOne({ rationCardNo });
    if (existingCard) {
      return res.status(400).json({ success: false, error: 'Ration card number is already registered.' });
    }

    // Perform mock government ration card KYC check
    const kycResult = await verifyRationCardNo(rationCardNo);
    const initialStatus = kycResult.matched ? 'verified' : 'pending';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: headOfHouseholdName || name,
      email: userEmail,
      passwordHash,
      role: 'consumer',
      phone,
      phoneVerified: true,
      status: initialStatus
    });

    const consumerProfile = await ConsumerProfile.create({
      user: newUser._id,
      rationCardNo,
      rationCardType: cardType,
      rationCardVerified: kycResult.matched,
      address,
      assignedShopId: shopId,
      headOfHouseholdName: headOfHouseholdName || name
    });

    // Save family members with encrypted Aadhaar
    if (familyMembers && Array.isArray(familyMembers)) {
      for (const member of familyMembers) {
        const encryptedAadhaar = encrypt(member.aadhaarNumber);
        const maskedAadhaar = maskAadhaar(member.aadhaarNumber);
        
        await FamilyMember.create({
          consumerProfile: consumerProfile._id,
          name: member.name,
          relation: member.relation,
          dateOfBirth: member.dateOfBirth,
          aadhaarEncrypted: encryptedAadhaar,
          aadhaarMasked: maskedAadhaar,
          isMinor: false
        });
      }
    }

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      success: true,
      message: kycResult.matched 
        ? 'Consumer registered & verified against ration registry.' 
        : 'Consumer registered. Pending Admin verification queue.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        rationCardNo,
        cardType
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, rationCardNo, loginInput } = req.body;
    const queryInput = (loginInput || email || '').trim();

    let user;
    if (rationCardNo || (queryInput && queryInput.toUpperCase().startsWith('RC'))) {
      const targetCard = (rationCardNo || queryInput).trim();
      const profile = await ConsumerProfile.findOne({ rationCardNo: targetCard });
      if (profile) {
        user = await User.findById(profile.user);
      }
    }

    if (!user && queryInput) {
      user = await User.findOne({ email: queryInput.toLowerCase() });
    } else if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid password.' });
    }

    const token = generateToken(user._id, user.role);

    // Fetch additional profile data
    let profileData = {};
    if (user.role === 'distributor') {
      const distProf = await DistributorProfile.findOne({ user: user._id }).populate('shopId');
      if (distProf) {
        profileData = {
          distributorGovtId: distProf.distributorGovtId,
          shopId: distProf.shopId ? distProf.shopId._id : null,
          shopName: distProf.shopId ? distProf.shopId.shopName : '',
          aadhaarMasked: distProf.aadhaarMasked
        };
      }
    } else if (user.role === 'consumer') {
      const consProf = await ConsumerProfile.findOne({ user: user._id }).populate('assignedShopId');
      if (consProf) {
        profileData = {
          rationCardNo: consProf.rationCardNo,
          rationCardType: consProf.rationCardType,
          assignedShop: consProf.assignedShopId
        };
      }
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        ...profileData
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send OTP
// @route   POST /api/auth/otp/send
// @access  Public
const sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required.' });
  const result = generateOtp(phone);
  res.json({ success: true, ...result });
};

// @desc    Verify OTP
// @route   POST /api/auth/otp/verify
// @access  Public
const verifyOtpHandler = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, error: 'Phone and OTP are required.' });
  const result = verifyOtp(phone, otp);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
};

module.exports = {
  registerDistributor,
  registerConsumer,
  login,
  sendOtp,
  verifyOtpHandler
};
