import { DataTypes, Sequelize } from 'sequelize';

export default (sequelize: Sequelize) => {
  const Allowance = sequelize.define('Allowance', {
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
  });

  return Allowance;
};
