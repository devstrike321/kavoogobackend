const mongoose = require('mongoose');

const mobileProviderSchema = new mongoose.Schema({
  balance: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('MobileProvider', mobileProviderSchema);