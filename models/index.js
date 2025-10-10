const User = require("./userSchema");
const Partner = require("./partnerSchema");
const Campaign = require("./campaignSchema");
const Transaction = require("./transactionSchema");
const MobileProvider = require("./mobileProviderSchema");
const AdminUser = require("./adminUserSchema");

// Define associations
User.hasMany(Transaction, { foreignKey: "userId" });
Transaction.belongsTo(User, { foreignKey: "userId" });

Campaign.hasMany(Transaction, { foreignKey: "campaignId" });
Transaction.belongsTo(Campaign, { foreignKey: "campaignId" });

Partner.hasMany(Campaign, { foreignKey: "partnerId" });
Campaign.belongsTo(Partner, { foreignKey: "partnerId" });

// Export models
module.exports = {
  AdminUser,
  User,
  Partner,
  Campaign,
  Transaction,
  MobileProvider,
};