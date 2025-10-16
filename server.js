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

//Force DigitalOcean Internal Network SSL workaround
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


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

// Set ALLOWED_ORIGINS="http://localhost:3000,https://app.example.com"
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000, https://localhost:5000')
  .split(',')
  .map(o => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (e.g., curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// enable preflight for all routes
app.options('*', cors(corsOptions));

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