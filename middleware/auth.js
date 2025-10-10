const jwt = require('jsonwebtoken');
const { User, Partner, AdminUser } = require('../models');

// Middleware to authenticate using JWT token
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
    let user;
    if (decoded.role === 'user') {
      user = await User.findByPk(decoded.id);
    } else if (decoded.role === 'partner') {
      user = await Partner.findByPk(decoded.id);
    } else if (decoded.role === 'adminUser') {
      user = await AdminUser.findByPk(decoded.id);
    }
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    req.user = user;
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

const dashboardAuth = (req, res, next) => {
  if (req.role === 'partner' || req.role === 'adminUser') next();
  else res.status(403).json({ msg: 'Not authorized for dashboard' });
};

module.exports = { protect, userAuth, partnerAuth, adminAuth, teamAuth, dashboardAuth };  