const mongoose = require('mongoose');
const shortid = require('shortid');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['completed', 'pending', 'failed'] },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

transactionSchema.pre('save', function (next) {
  if (!this.transactionId) {
    const dateStr = new Date().toISOString().slice(0, 10);
    this.transactionId = `TXN-${dateStr}-${shortid.generate()}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);