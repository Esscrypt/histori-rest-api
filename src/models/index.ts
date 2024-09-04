import { Sequelize } from 'sequelize';
import TokenModel from './token';
import AllowanceModel from './allowance';
import BalanceModel from './balance';

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  logging: false,
});

const Token = TokenModel(sequelize);
const Allowance = AllowanceModel(sequelize);
const Balance = BalanceModel(sequelize);

Token.hasMany(Allowance, { foreignKey: 'tokenId', as: 'allowances' });
Token.hasMany(Balance, { foreignKey: 'tokenId', as: 'balances' });

Allowance.belongsTo(Token, { foreignKey: 'tokenId', as: 'token' });
Balance.belongsTo(Token, { foreignKey: 'tokenId', as: 'token' });

export { sequelize, Token, Allowance, Balance };
