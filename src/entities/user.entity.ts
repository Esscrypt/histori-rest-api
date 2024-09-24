import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
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

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the user' })
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: 'Email address of the user', uniqueItems: true })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @Column()
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

  @Column()
  @ApiProperty({
    description: 'Stripe customer ID associated with the user',
  })
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
  requestCount: number; // Field to track request count

  @Column({ default: 5000 })
  @ApiProperty({
    description: 'Custom rate limit for the user. Meant for enterprise users.',
  })
  requestLimit: number; // Field to track request count

  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: 'Ethereum wallet address associated with the user',
  })
  @IsOptional()
  @IsEthereumAddress({ message: 'Invalid Ethereum wallet address' })
  walletAddress?: string;

  // Temporary in-memory property to hold the original password before any updates
  private tempPassword: string;

  // This lifecycle hook ensures the original password is loaded into `tempPassword`
  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  // Hook to hash the password before saving
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.tempPassword !== this.password) {
      const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  // Auto-generate API key before inserting a new user
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
  }
}
