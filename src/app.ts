import dotenv from 'dotenv';

dotenv.config(); 

import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import tokenRoutes from './routes/tokenRoutes';
import allowanceRoutes from './routes/allowanceRoutes';
import balanceRoutes from './routes/balanceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import authRoutes from './routes/authRoutes';

import { connectDB } from './config/db';

import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

import logger from './middleware/logger';
import { handleStripeWebhook } from './controllers/paymentController';

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors());
// Use Morgan to log HTTP requests and integrate with Winston
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.http(message.trim())
  }
}));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Authentication API',
      version: '1.0.0',
      description: 'API for user authentication and authorization',
    },
    servers: [
      {
        url: 'http://localhost:4242',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Database Connection
connectDB();

// Webhook needs to use raw body for Stripe's signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/', paymentRoutes);
app.use('/tokens', tokenRoutes);
app.use('/allowances', allowanceRoutes);
app.use('/balances', balanceRoutes);


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
