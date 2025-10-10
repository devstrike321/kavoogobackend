const bcrypt = require('bcryptjs');
const shortid = require('shortid');
const sequelize = require('./config/db');
const { AdminUser, Partner, Campaign, User, Transaction, MobileProvider } = require('./models');

// Function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedData = async () => {
  try {
    await sequelize.sync({ force: true }); // Drops and recreates tables

    // Seed AdminUsers
    const adminPassword = await hashPassword('adminpass123');
    const teamPassword = await hashPassword('teampass123');
    const adminUsers = await AdminUser.bulkCreate([
      {
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        phone: '123-456-7890',
        country: 'United States',
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
    ]);
    console.log('AdminUsers seeded');

    // Seed Partners
    const partnerPassword1 = await hashPassword('partnerpass1');
    const partnerPassword2 = await hashPassword('partnerpass2');
    const partners = await Partner.bulkCreate([
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
    ]);
    console.log('Partners seeded');

    // Seed Campaigns
    const campaigns = await Campaign.bulkCreate([
      {
        name: 'Campaign Video 1',
        description: 'Video campaign for partner 1',
        partnerId: partners[0].id,
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
        videoUrl: 'https://example.com/video1.mp4',
        videoDuration: 30,
      },
      {
        name: 'Campaign Video Survey 1',
        description: 'Video survey campaign for partner 1',
        partnerId: partners[0].id,
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
        videoUrl: 'https://example.com/video2.mp4',
        videoDuration: 45,
        surveyLink: 'https://example.com/survey1',
      },
      {
        name: 'Campaign Survey 1',
        description: 'Survey campaign for partner 1',
        partnerId: partners[0].id,
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
      {
        name: 'Campaign Video 2',
        description: 'Video campaign for partner 2',
        partnerId: partners[1].id,
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
        videoUrl: 'https://example.com/video3.mp4',
        videoDuration: 60,
      },
      {
        name: 'Campaign Survey 2',
        description: 'Survey campaign for partner 2',
        partnerId: partners[1].id,
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
    ]);
    console.log('Campaigns seeded');

    // Seed Users
    const users = await User.bulkCreate([
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
        hasKids: 'no',
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
        country: 'United States',
        city: 'Chicago',
        employmentStatus: 'self-employed',
        educationLevel: 'master',
        maritalStatus: 'married',
        hasKids: 'yes',
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
        country: 'United States',
        city: 'Miami',
        employmentStatus: 'unemployed',
        educationLevel: 'high school',
        maritalStatus: 'divorced',
        hasKids: 'no',
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
        country: 'United States',
        city: 'Seattle',
        employmentStatus: 'employed',
        educationLevel: 'phd',
        maritalStatus: 'single',
        hasKids: 'yes',
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
        country: 'United States',
        city: 'Boston',
        employmentStatus: 'student',
        educationLevel: 'associate',
        maritalStatus: 'married',
        hasKids: 'no',
        salaryRangeMin: 10000,
        salaryRangeMax: 30000,
        hasBankAccount: false,
        referralCode: 'REF005',
      },
    ]);
    console.log('Users seeded');

    // Seed Transactions
    const transactions = [
      { campaignId: campaigns[0].id, userId: users[0].id, status: 'completed', transactionId: `TXN-${shortid.generate()}` },
      { campaignId: campaigns[1].id, userId: users[0].id, status: 'completed', transactionId: `TXN-${shortid.generate()}` },
      { campaignId: campaigns[2].id, userId: users[1].id, status: 'pending', transactionId: `TXN-${shortid.generate()}` },
      { campaignId: campaigns[3].id, userId: users[1].id, status: 'completed', transactionId: `TXN-${shortid.generate()}` },
      { campaignId: campaigns[4].id, userId: users[2].id, status: 'failed', transactionId: `TXN-${shortid.generate()}` },
      { campaignId: campaigns[0].id, userId: users[2].id, status: 'completed', transactionId: `TXN-${shortid.generate()}` },
      { campaignId: campaigns[1].id, userId: users[2].id, status: 'completed', transactionId: `TXN-${shortid.generate()}` },
      { campaignId: campaigns[2].id, userId: users[3].id, status: 'completed', transactionId: `TXN-${shortid.generate()}` },
      { campaignId: campaigns[3].id, userId: users[3].id, status: 'pending', transactionId: `TXN-${shortid.generate()}` },
      { campaignId: campaigns[4].id, userId: users[3].id, status: 'completed', transactionId: `TXN-${shortid.generate()}` },
    ];
    await Transaction.bulkCreate(transactions);
    console.log('Transactions seeded');

    // Seed MobileProvider
    await MobileProvider.create({ balance: 10000 });
    console.log('MobileProvider seeded');

    console.log('Seeding completed');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();