import express from 'express';
import serverless from 'serverless-http';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import tokenRoutes from './routes/tokenRoutes';
import allowanceRoutes from './routes/allowanceRoutes';
import balanceRoutes from './routes/balanceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import logger from './middleware/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json'; // Assuming you have this file

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined'));

// Routes
app.use('/tokens', tokenRoutes);
app.use('/allowances', allowanceRoutes);
app.use('/balances', balanceRoutes);
app.use('/payments', paymentRoutes);

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

// Export the serverless handler
export const handler = serverless(app);
