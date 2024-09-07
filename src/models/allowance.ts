import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Define an interface for the Allowance attributes
interface AllowanceAttributes {
  id: number;
  tokenId: number;
  owner: string;
  spender: string;
  allowance: string;
  blockNumber: number;
}

// Some fields are optional when creating a new Allowance (e.g., id)
interface AllowanceCreationAttributes extends Optional<AllowanceAttributes, 'id'> {}

// Create the Allowance model class with types
class Allowance extends Model<AllowanceAttributes, AllowanceCreationAttributes> implements AllowanceAttributes {
  public id!: number;
  public tokenId!: number;
  public owner!: string;
  public spender!: string;
  public allowance!: string;
  public blockNumber!: number;

  // Timestamps can also be defined here (if needed)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the Allowance model
export default (sequelize: Sequelize) => {
  Allowance.init(
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
      owner: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      spender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      allowance: {
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
      tableName: 'allowances',
    }
  );

  return Allowance;
};
