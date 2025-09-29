const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const AWS = require('aws-sdk');
const cors = require('cors');
const path = require('path');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(cors({
	origin: 'http://localhost:3000',
	methods: ['GET','POST','PUT','DELETE','OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/admins', require('./routes/adminUserRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
//app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));