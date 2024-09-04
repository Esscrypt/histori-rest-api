import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
  const Balance = sequelize.define('Balance', {
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
  });

  return Balance;
};
