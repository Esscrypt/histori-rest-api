import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsEthereumAddress,
  IsString,
  MinLength,
} from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the user' })
  id: number;

  @Column({ unique: true, nullable: true })
  githubId: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Email address of the user', uniqueItems: true })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Password for the user account' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @Column({ default: false })
  @ApiProperty({
    description: 'Whether the user account is active or not',
    default: false,
  })
  isActive: boolean;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Username for the user account' })
  @IsOptional()
  username?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Full name of the user' })
  @IsOptional()
  firstName?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Last name of the user' })
  @IsOptional()
  lastName?: string;

  @Column()
  @ApiProperty({ description: 'Stripe customer ID associated with the user' })
  stripeCustomerId: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'API key for the user to access APIs' })
  apiKey: string;

  @Column({
    type: 'enum',
    enum: ['Free', 'Starter', 'Growth', 'Business', 'Enterprise'],
    default: 'Free',
  })
  @ApiProperty({
    description: 'API tier assigned to the user',
    enum: ['Free', 'Starter', 'Growth', 'Business', 'Enterprise'],
    default: 'Free',
  })
  @IsEnum(['Free', 'Starter', 'Growth', 'Business', 'Enterprise'], {
    message:
      'Tier must be one of the following: Free, Starter, Growth, Business, Enterprise',
  })
  tier: string;

  @Column({ default: 0 })
  requestCount: number;

  @Column({ default: 5000 })
  @ApiProperty({
    description: 'Custom rate limit for the user. Meant for enterprise users.',
  })
  requestLimit: number;

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'Ethereum wallet address associated with the user',
  })
  @IsOptional()
  @IsEthereumAddress({ message: 'Invalid Ethereum wallet address' })
  web3Address?: string; // New column for Web3 wallet address

  @Column({ unique: true })
  @ApiProperty({ description: 'Referral code for the user to refer others' })
  referralCode: string;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Referral code of the referrer' })
  referrerCode?: string;

  @Column({ default: 0 })
  @ApiProperty({ description: 'Referral points accumulated by the user' })
  referralPoints: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'The date the user was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The last date the user was updated' })
  updatedAt: Date;

  private tempPassword: string;

  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.tempPassword !== this.password) {
      const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  @BeforeInsert()
  generateReferralCode() {
    this.referralCode = `${this.email.split('@')[0]}-${uuidv4().slice(0, 8)}`;
  }

  @BeforeInsert()
  generateApiKey() {
    const prefix = 'HISTORI_';
    const uuidPart = uuidv4().replace(/[^a-zA-Z0-9]/g, '');
    this.apiKey = `${prefix}${uuidPart}`;
  }

  async comparePassword(enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  async compareApiKey(providedApiKey: string): Promise<boolean> {
    return this.apiKey === providedApiKey;
  }
}
