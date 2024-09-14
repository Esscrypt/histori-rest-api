import { Column, Entity, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export enum ApiKeyTier {
  BASIC = 'basic',
  STANDARD = 'standard',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ nullable: true })
  resetTokenExpiration?: Date;

  @Column({ nullable: true })
  apiKey?: string;

  @Column({ type: 'enum', enum: ApiKeyTier, default: ApiKeyTier.BASIC })
  apiKeyTier: ApiKeyTier;  // Add API Key Tier with default as BASIC

  @BeforeInsert()
  generateApiKey() {
    if (!this.apiKey) {
      this.apiKey = uuidv4();
    }
  }

  async comparePassword(enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  async compareApiKey(providedApiKey: string): Promise<boolean> {
    return this.apiKey === providedApiKey;
 
