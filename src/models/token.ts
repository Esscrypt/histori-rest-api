import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Define an interface for the Token attributes
interface TokenAttributes {
  id: number;
  name: string;
  symbol: string;
  decimals: number;
  contractAddress: string;
  totalSupply: string;
  blockNumber: number;
  tokenURI?: string;
  additionalMetadata?: Record<string, any>;
}

// Some fields are optional when creating a new Token (e.g., id)
interface TokenCreationAttributes extends Optional<TokenAttributes, 'id'> {}

// Create the Token model class with types
class Token extends Model<TokenAttributes, TokenCreationAttributes> implements TokenAttributes {
  public id!: number;
  public name!: string;
  public symbol!: string;
  public decimals!: number;
  public contractAddress!: string;
  public totalSupply!: string;
  public blockNumber!: number;
  public tokenURI?: string;
  public additionalMetadata?: Record<string, any>;

  // Timestamps can also be defined here (if needed)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the Token model
export default (sequelize: Sequelize) => {
  Token.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      decimals: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contractAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      totalSupply: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      blockNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tokenURI: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      additionalMetadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'tokens',
    }
  );

  return Token;
};
