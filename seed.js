const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const shortid = require('shortid');

// Import models (adjust paths as needed based on your project structure)
const AdminUser = require('./models/adminUserSchema');
const Partner = require('./models/partnerSchema');
const Campaign = require('./models/campaignSchema');
const User = require('./models/userSchema');
const Transaction = require('./models/transactionSchema');
const MobileProvider = require('./models/mobileProviderSchema');

// Connect to MongoDB (replace with your connection string)
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/kavoo_go', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// Function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Seed data
const seedData = async () => {
  await connectDB();

  // Clear existing data (optional, for clean seeding)
  await AdminUser.deleteMany({});
  await Partner.deleteMany({});
  await Campaign.deleteMany({});
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await MobileProvider.deleteMany({});

  // Seed AdminUsers: 1 admin, 2 team members
  const adminPassword = await hashPassword('adminpass123');
  const teamPassword = await hashPassword('teampass123');

  const adminUsers = [
    {
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '123-456-7890',
      country: 'USA',
      city: 'New York',
      status: 'active',
    },
    {
      email: 'developer@example.com',
      password: teamPassword,
      title: 'developer',
      role: 'team',
      firstName: 'Dev',
      lastName: 'Team',
      phone: '987-654-3210',
      country: 'USA',
      city: 'San Francisco',
      status: 'active',
    },
    {
      email: 'manager@example.com',
      password: teamPassword,
      title: 'manager',
      role: 'team',
      firstName: 'Manager',
      lastName: 'Team',
      phone: '555-555-5555',
      country: 'USA',
      city: 'Los Angeles',
      status: 'active',
    },
  ];

  const createdAdminUsers = await AdminUser.insertMany(adminUsers);
  console.log('AdminUsers seeded');

  // Seed Partners: 2 partners
  const partnerPassword1 = await hashPassword('partnerpass1');
  const partnerPassword2 = await hashPassword('partnerpass2');

  const partners = [
    {
      email: 'partner1@example.com',
      password: partnerPassword1,
      partnerName: 'Partner One',
      phone: '111-222-3333',
      status: 'active',
      industry: 'Tech',
      contactPerson: 'Contact One',
    },
    {
      email: 'partner2@example.com',
      password: partnerPassword2,
      partnerName: 'Partner Two',
      phone: '444-555-6666',
      status: 'active',
      industry: 'Finance',
      contactPerson: 'Contact Two',
    },
  ];

  const createdPartners = await Partner.insertMany(partners);
  const partner1Id = createdPartners[0]._id;
  const partner2Id = createdPartners[1]._id;
  console.log('Partners seeded');

  // Seed Campaigns: 5 total (3 for partner1: video, video_survey, survey; 2 for partner2: video, survey)
  const campaigns = [
    // Partner 1 campaigns
    {
      name: 'Campaign Video 1',
      description: 'Video campaign for partner 1',
      partner: partner1Id,
      activityType: 'Video',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      status: 'Active',
      minAge: 18,
      maxAge: 65,
      country: 'USA',
      city: 'New York',
      employmentStatus: 'employed',
      educationLevel: 'bachelor',
      minSalary: 30000,
      maxSalary: 100000,
      maritalStatus: 'single',
      hasKids: 'no',
      rewardAmount: 5,
      totalBudget: 1000,
      costPerUser: 2,
      maxUsers: 500,
      video: { url: 'https://example.com/video1.mp4', duration: 30 },
    },
    {
      name: 'Campaign Video Survey 1',
      description: 'Video survey campaign for partner 1',
      partner: partner1Id,
      activityType: 'Video_survey',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-11-30'),
      status: 'Active',
      minAge: 25,
      maxAge: 50,
      country: 'USA',
      city: 'Chicago',
      employmentStatus: 'self-employed',
      educationLevel: 'master',
      minSalary: 50000,
      maxSalary: 150000,
      maritalStatus: 'married',
      hasKids: 'yes',
      rewardAmount: 10,
      totalBudget: 2000,
      costPerUser: 4,
      maxUsers: 500,
      video: { url: 'https://example.com/video2.mp4', duration: 45 },
      surveyLink: 'https://example.com/survey1',
    },
    {
      name: 'Campaign Survey 1',
      description: 'Survey campaign for partner 1',
      partner: partner1Id,
      activityType: 'Survey',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-10-31'),
      status: 'Active',
      minAge: 18,
      maxAge: 40,
      country: 'USA',
      city: 'Miami',
      employmentStatus: 'unemployed',
      educationLevel: 'high school',
      minSalary: 20000,
      maxSalary: 80000,
      maritalStatus: 'divorced',
      hasKids: 'no',
      rewardAmount: 3,
      totalBudget: 600,
      costPerUser: 1,
      maxUsers: 600,
      surveyLink: 'https://example.com/survey2',
    },
    // Partner 2 campaigns
    {
      name: 'Campaign Video 2',
      description: 'Video campaign for partner 2',
      partner: partner2Id,
      activityType: 'Video',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-09-30'),
      status: 'Active',
      minAge: 30,
      maxAge: 60,
      country: 'USA',
      city: 'Seattle',
      employmentStatus: 'employed',
      educationLevel: 'phd',
      minSalary: 70000,
      maxSalary: 200000,
      maritalStatus: 'single',
      hasKids: 'yes',
      rewardAmount: 7,
      totalBudget: 1400,
      costPerUser: 3,
      maxUsers: 466,
      video: { url: 'https://example.com/video3.mp4', duration: 60 },
    },
    {
      name: 'Campaign Survey 2',
      description: 'Survey campaign for partner 2',
      partner: partner2Id,
      activityType: 'Survey',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-08-31'),
      status: 'Active',
      minAge: 20,
      maxAge: 45,
      country: 'USA',
      city: 'Boston',
      employmentStatus: 'student',
      educationLevel: 'associate',
      minSalary: 10000,
      maxSalary: 50000,
      maritalStatus: 'married',
      hasKids: 'no',
      rewardAmount: 4,
      totalBudget: 800,
      costPerUser: 2,
      maxUsers: 400,
      surveyLink: 'https://example.com/survey3',
    },
  ];

  const createdCampaigns = await Campaign.insertMany(campaigns);
  const campaignIds = createdCampaigns.map(c => c._id);
  console.log('Campaigns seeded');

  // Seed Users: 5 users (4 with 1-2 transactions later)
  const users = [
    {
      phone: '1000000001',
      firstName: 'User',
      lastName: 'One',
      email: 'user1@example.com',
      gender: 'male',
      dateOfBirth: new Date('1990-01-01'),
      country: 'USA',
      city: 'New York',
      employmentStatus: 'employed',
      educationLevel: 'bachelor',
      maritalStatus: 'single',
      hasKids: false,
      salaryRangeMin: 30000,
      salaryRangeMax: 60000,
      hasBankAccount: true,
      referralCode: 'REF001',
    },
    {
      phone: '1000000002',
      firstName: 'User',
      lastName: 'Two',
      email: 'user2@example.com',
      gender: 'female',
      dateOfBirth: new Date('1985-05-15'),
      country: 'USA',
      city: 'Chicago',
      employmentStatus: 'self-employed',
      educationLevel: 'master',
      maritalStatus: 'married',
      hasKids: true,
      salaryRangeMin: 50000,
      salaryRangeMax: 100000,
      hasBankAccount: true,
      referralCode: 'REF002',
    },
    {
      phone: '1000000003',
      firstName: 'User',
      lastName: 'Three',
      email: 'user3@example.com',
      gender: 'male',
      dateOfBirth: new Date('1995-07-20'),
      country: 'USA',
      city: 'Miami',
      employmentStatus: 'unemployed',
      educationLevel: 'high school',
      maritalStatus: 'divorced',
      hasKids: false,
      salaryRangeMin: 20000,
      salaryRangeMax: 40000,
      hasBankAccount: false,
      referralCode: 'REF003',
    },
    {
      phone: '1000000004',
      firstName: 'User',
      lastName: 'Four',
      email: 'user4@example.com',
      gender: 'female',
      dateOfBirth: new Date('1980-03-10'),
      country: 'USA',
      city: 'Seattle',
      employmentStatus: 'employed',
      educationLevel: 'phd',
      maritalStatus: 'single',
      hasKids: true,
      salaryRangeMin: 70000,
      salaryRangeMax: 150000,
      hasBankAccount: true,
      referralCode: 'REF004',
    },
    {
      phone: '1000000005',
      firstName: 'User',
      lastName: 'Five',
      email: 'user5@example.com',
      gender: 'male',
      dateOfBirth: new Date('2000-11-25'),
      country: 'USA',
      city: 'Boston',
      employmentStatus: 'student',
      educationLevel: 'associate',
      maritalStatus: 'married',
      hasKids: false,
      salaryRangeMin: 10000,
      salaryRangeMax: 30000,
      hasBankAccount: false,
      referralCode: 'REF005',
    },
  ];

  const createdUsers = await User.insertMany(users);
  const userIds = createdUsers.map(u => u._id);
  console.log('Users seeded');

  // Seed Transactions: 10 transactions with different campaigns (cycling through campaigns)
  // Assign to 4 users (users 1-4), each with 1-2 transactions (e.g., user1:2, user2:2, user3:3, user4:3 to total 10)



  const transactions = [
    { campaign: campaignIds[0], user: userIds[0], status: 'completed' },
    { campaign: campaignIds[1], user: userIds[0], status: 'completed' },
    { campaign: campaignIds[2], user: userIds[1], status: 'pending' },
    { campaign: campaignIds[3], user: userIds[1], status: 'completed' },
    { campaign: campaignIds[4], user: userIds[2], status: 'failed' },
    { campaign: campaignIds[0], user: userIds[2], status: 'completed' },
    { campaign: campaignIds[1], user: userIds[2], status: 'completed' },
    { campaign: campaignIds[2], user: userIds[3], status: 'completed' },
    { campaign: campaignIds[3], user: userIds[3], status: 'pending' },
    { campaign: campaignIds[4], user: userIds[3], status: 'completed' },
  ];

  transactions.map((tx) => {
    const dateStr = new Date().toISOString().slice(0, 10);
    tx.transactionId = `TXN-${dateStr}-${shortid.generate()}`;
  });

  const createdTransactions = await Transaction.insertMany(transactions);

  // Update Users and Partners with references (campaigns for partners, transactions for users)
  await Partner.findByIdAndUpdate(partner1Id, { campaigns: [campaignIds[0], campaignIds[1], campaignIds[2]] });
  await Partner.findByIdAndUpdate(partner2Id, { campaigns: [campaignIds[3], campaignIds[4]] });

  await User.findByIdAndUpdate(userIds[0], { transactions: [createdTransactions[0]._id, createdTransactions[1]._id] });
  await User.findByIdAndUpdate(userIds[1], { transactions: [createdTransactions[2]._id, createdTransactions[3]._id] });
  await User.findByIdAndUpdate(userIds[2], { transactions: [createdTransactions[4]._id, createdTransactions[5]._id, createdTransactions[6]._id] });
  await User.findByIdAndUpdate(userIds[3], { transactions: [createdTransactions[7]._id, createdTransactions[8]._id, createdTransactions[9]._id] });
  // User 5 has no transactions

  console.log('Transactions seeded');

  // Seed MobileProvider: 1
  await MobileProvider.create({ balance: 10000 });
  console.log('MobileProvider seeded');

  console.log('Seeding completed');
  process.exit();
};

seedData();