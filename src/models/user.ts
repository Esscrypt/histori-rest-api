import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/db';


interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  refreshToken?: string;
  resetToken?: string;
  resetTokenExpiration?: Date;
  stripeClientId?: string;
  awsApiGatewayApiKey?: string;
}

export class User extends Model<UserAttributes> {
  public id!: number;
  public email!: string;
  public password!: string;
  public refreshToken?: string;
  public resetToken?: string;
  public resetTokenExpiration?: Date;
  public stripeClientId?: string;
  public awsApiGatewayApiKey?: string;

  // Compare password method without hooks
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
      allowNull: true,
    },
    resetTokenExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    stripeClientId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    awsApiGatewayApiKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user: User) => {
        const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
        user.password = await bcrypt.hash(user.password, saltRounds);
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
          user.password = await bcrypt.hash(user.password, saltRounds);
        }      
      },
    },
  }
);
