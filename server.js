// ...existing code...
const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // <- moved up so env vars exist before requiring ./config/db
const AWS = require('aws-sdk');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const sequelize = require('./config/db');


(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
})();

dotenv.config();
sequelize.sync(); // or sequelize.sync({ force: true }) for development

const app = express();
app.use(express.json());

app.use(cors({
	origin: 'http://localhost:3000',
	methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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