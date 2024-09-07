import express from 'express';
import serverless from 'serverless-http';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config(); 

import tokenRoutes from './routes/tokenRoutes';
import allowanceRoutes from './routes/allowanceRoutes';
import balanceRoutes from './routes/balanceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import authRoutes from './routes/authRoutes';

import { connectDB } from './config/db';
import swaggerDocument from './docs/swagger.json';

import logger from './middleware/logger';
import swaggerUi from 'swagger-ui-express';


const app = express();

// Middleware
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined'));

// Routes
app.use('/tokens', tokenRoutes);
app.use('/allowances', allowanceRoutes);
app.use('/balances', balanceRoutes);
app.use('/', paymentRoutes);
app.use('/auth', authRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the EVM Token API');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Database Connection
connectDB();

// Determine if running locally or in serverless environment
if (process.env.NODE_ENV === 'development') {
  // Start Express server locally
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running locally on port ${port}`);
  });
} else {
  // Export serverless handler for AWS Lambda
  module.exports.handler = serverless(app);
}
