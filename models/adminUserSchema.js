const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    title: String,
    role: { type: String, enum: ['admin', 'team'], default: 'team' },
    phone: String,
    status: { type: String, default: 'active' },
    firstName: String,
    lastName: String,
    country: String,
    city: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminUser', adminUserSchema);