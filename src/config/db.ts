import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // Disable `sync` in production
    // if (process.env.NODE_ENV !== 'production') {
    //   await sequelize.sync({alter: true});  // This will create tables or update them if necessary
    // }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
