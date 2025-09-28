const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    otp: String,
    firstName: String,
    lastName: String,
    email: String,
    gender: String,
    dateOfBirth: Date,
    country: String,
    city: String,
    employmentStatus: { type: String, default: 'employed' },
    educationLevel: String,
    maritalStatus: String,
    hasKids: Boolean,
    salaryRangeMin: Number,
    salaryRangeMax: Number,
    hasBankAccount: Boolean,
    rewards: { type: Number, default: 0 },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);