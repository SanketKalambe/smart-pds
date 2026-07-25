const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smart_pds_jwt_secret_key_2026_super_secure');
    req.user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User account no longer exists.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token invalid or expired.' });
  }
};

module.exports = { protect };
