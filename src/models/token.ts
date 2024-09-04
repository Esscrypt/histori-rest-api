import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
  const Token = sequelize.define('Token', {
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
  });

  return Token;
};
