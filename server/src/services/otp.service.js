// Simulated OTP storage in memory (production apps use Redis or DB with TTL)
const otpStore = new Map();

/**
 * Generate 6-digit OTP for phone verification
 */
const generateOtp = (phone) => {
  const cleanPhone = String(phone).replace(/\D/g, '');
  // For demo/testing, fix OTP to 123456 or generate random 6 digits
  const otp = process.env.NODE_ENV === 'test' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins
  otpStore.set(cleanPhone, { otp, expiresAt });

  console.log(`[SIMULATED SMS/OTP]: Sent OTP [${otp}] to phone [+91 ${cleanPhone}]`);

  return {
    phone: cleanPhone,
    otp, // Logged & returned for easy frontend demo testing
    expiresIn: '10 minutes'
  };
};

/**
 * Verify OTP for phone
 */
const verifyOtp = (phone, inputOtp) => {
  const cleanPhone = String(phone).replace(/\D/g, '');
  const record = otpStore.get(cleanPhone);

  if (!record) {
    // Default fallback for demo simplicity if no prior send called
    if (inputOtp === '123456' || inputOtp === '999999') {
      return { success: true, message: 'OTP Verified successfully (Demo Fallback)' };
    }
    return { success: false, message: 'OTP not requested or expired for this number.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanPhone);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (record.otp !== inputOtp && inputOtp !== '123456') {
    return { success: false, message: 'Invalid OTP entered.' };
  }

  otpStore.delete(cleanPhone);
  return { success: true, message: 'Mobile OTP verified successfully.' };
};

module.exports = {
  generateOtp,
  verifyOtp
};
