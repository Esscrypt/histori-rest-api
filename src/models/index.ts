import { Sequelize } from 'sequelize';

// Use DATABASE_URL if it's available, otherwise use individual settings
const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  // logging: console.log,
  logging: false
})

// Import and initialize your models
import createTokenModel from './token';
import createBalanceModel from './balance';
import createAllowanceModel from './allowance';

const Token = createTokenModel(sequelize);
const Balance = createBalanceModel(sequelize);
const Allowance = createAllowanceModel(sequelize);

// Export the models and Sequelize instance
export { sequelize, Token, Balance, Allowance };
