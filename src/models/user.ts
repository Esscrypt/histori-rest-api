import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db';

interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  refreshToken?: string;
  resetToken?: string;
  resetTokenExpiration?: Date;
}

export class User extends Model<UserAttributes> {
  public id!: number;
  public email!: string;
  public password!: string;
  public refreshToken?: string;
  public resetToken?: string;
  public resetTokenExpiration?: Date;

  // Compare password
  public async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
    },
    resetToken: {
      type: DataTypes.STRING,
    },
    resetTokenExpiration: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user: User) => {
        user.password = await bcrypt.hash(user.password, 12);
      },
    },
  }
);
