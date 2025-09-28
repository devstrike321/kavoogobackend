// seed.js
// Run this script to seed initial data into the MongoDB database.
// Usage: node seed.js
// Assumes you have Mongoose models defined in your project.
// Make sure to update the connection string and model imports as per your project structure.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Assuming you use bcrypt for password hashing

// Import your models (adjust paths as needed)
const AdminUser = require('./models/adminUserSchema');
const Partner = require('./models/partnerSchema');
const User = require('./models/userSchema');
const Campaign = require('./models/campaignSchema');
const MobileProvider = require('./models/mobileProviderSchema');
const Transaction = require('./models/transactionSchema');

// MongoDB connection string (update with your DB details)
const mongoURI = 'mongodb://localhost:27017/kavoo_go';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedData = async () => {
  try {
    // Clear existing data (optional, comment out if not needed)
    await AdminUser.deleteMany({});
    await Partner.deleteMany({});
    await User.deleteMany({});
    await Campaign.deleteMany({});
    await MobileProvider.deleteMany({});
    await Transaction.deleteMany({});

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Seed Admin Users
    const admin = new AdminUser({
      email: 'admin@example.com',
      password: hashedPassword,
      title: 'admin',
      role: 'admin',
      phoneNumber: '+1234567890',
      status: 'active',
      firstName: 'Admin',
      lastName: 'User',
      country: 'USA',
      city: 'New York'
    });
    await admin.save();

    const teamMember = new AdminUser({
      email: 'team@example.com',
      password: hashedPassword,
      title: 'developer',
      role: 'team',
      phoneNumber: '+0987654321',
      status: 'active',
      firstName: 'Team',
      lastName: 'Member',
      country: 'USA',
      city: 'Los Angeles'
    });
    await teamMember.save();

    // Seed Partners
    const partner = new Partner({
      email: 'partner@example.com',
      password: hashedPassword,
      partnerName: 'Partner Inc',
      phoneNumber: '+1122334455',
      status: 'active',
      industry: 'Tech',
      contactPerson: 'Jane Doe',
      campaigns: [] // Will add later
    });
    await partner.save();

    // Seed Users
    const user = new User({
      phone: '+1234567890',
      otp: '123456', // For testing, in prod generate dynamically
      userName: 'john_doe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      gender: 'male',
      targetingData: {
        dateOfBirth: new Date('1990-01-01'),
        country: 'USA',
        city: 'New York',
        employmentStatus: 'employed',
        educationLevel: 'bachelor',
        maritalStatus: 'single',
        kidsNoKids: 'no kids',
        salaryRange: {
          minValue: 50000,
          maxValue: 100000
        }
      },
      bankAccounts: 'yes',
      rewards: 0,
      transactions: [] // Will add later
    });
    await user.save();

    // Seed Mobile Providers
    const provider1 = new MobileProvider({
      balance: 100000 // Updated to cash as per changes
    });
    await provider1.save();

    const provider2 = new MobileProvider({
      name: 'MTN',
      secretkey: 'secretkey456',
      balance: 15
    });
    await provider2.save();

    const provider3 = new MobileProvider({
      name: 'Moov Africa',
      secretkey: 'secretkey789',
      balance: 20
    });
    await provider3.save();

    // Seed Campaigns
    const campaign = new Campaign({
      name: 'Sample Campaign',
      description: 'This is a test campaign',
      partner: partner._id,
      activityType: 'survey',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-31'),
      targetingData: {
        ageRange: {
          minAge: 18,
          maxAge: 65
        },
        country: 'USA',
        city: 'New York',
        employmentStatus: 'employed',
        educationLevel: 'bachelor',
        salaryRange: {
          minValue: 50000,
          maxValue: 100000
        },
        maritalStatus: 'single',
        kidsNoKids: 'no kids'
      },
      rewards: [
        {
          amount: 10,
          mobileProvider: 'Orange'
        }
      ],
      budgetAndLimit: {
        totalBudget: 1000,
        costPerUser: 5,
        numberOfUsers: 200
      },
      video: {}, // Assuming object for video details
      survey: 'https://tripetto.com/sample-link'
    });
    await campaign.save();

    // Update partner with campaign
    partner.campaigns.push(campaign._id);
    await partner.save();

    // Seed Transactions
    const issueDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const transaction = new Transaction({
      transactionId: `TXN-${issueDate}-001`,
      transactionDate: new Date(),
      transactionStatus: 'completed',
      campaign: campaign._id,
      participant: user._id // Assuming participant is user, but schema says partner._id? Comment: Changed to user as per flow, reason: Transactions are for users completing campaigns
    });
    await transaction.save();

    // Update user with transaction and rewards
    user.transactions.push(transaction._id);
    user.rewards += 10; // Add reward
    await user.save();

    console.log('Data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();