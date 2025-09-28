const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const Partner = require('../models/partnerSchema');
const AdminUser = require('../models/adminUserSchema');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.role = decoded.role;
    if (decoded.role === 'user') {
      req.user = await User.findById(decoded.id).select('-otp');
    } else if (decoded.role === 'partner') {
      req.user = await Partner.findById(decoded.id).select('-password');
    } else if (decoded.role === 'adminUser') {
      req.user = await AdminUser.findById(decoded.id).select('-password');
    }
    if (!req.user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const userAuth = (req, res, next) => {
  if (req.role === 'user') next();
  else res.status(403).json({ msg: 'Not authorized as user' });
};

const partnerAuth = (req, res, next) => {
  if (req.role === 'partner') next();
  else res.status(403).json({ msg: 'Not authorized as partner' });
};

const adminAuth = (req, res, next) => {
  if (req.role === 'adminUser' && req.user.role === 'admin') next();
  else res.status(403).json({ msg: 'Not authorized as admin' });
};

const teamAuth = (req, res, next) => {
  if (req.role === 'adminUser') next();
  else res.status(403).json({ msg: 'Not authorized as team' });
};

module.exports = { protect, userAuth, partnerAuth, adminAuth, teamAuth };