import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Define an interface for the Balance attributes
interface BalanceAttributes {
  id: number;
  tokenId: number;
  holder: string;
  balance: string;
  blockNumber: number;
}

// Some fields are optional when creating a new Balance (e.g., id)
interface BalanceCreationAttributes extends Optional<BalanceAttributes, 'id'> {}

// Create the Balance model class with types
class Balance extends Model<BalanceAttributes, BalanceCreationAttributes> implements BalanceAttributes {
  public id!: number;
  public tokenId!: number;
  public holder!: string;
  public balance!: string;
  public blockNumber!: number;

  // Timestamps can also be defined here (if needed)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the Balance model
export default (sequelize: Sequelize) => {
  Balance.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tokenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      holder: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      balance: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      blockNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'balances',
    }
  );

  return Balance;
};
