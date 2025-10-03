const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    partnerName: String,
    phone: String,
    status: { type: String, default: 'active' },
    industry: String,
    contactPerson: String,
    country: String,
    campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Partner', partnerSchema);