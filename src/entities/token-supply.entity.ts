import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('token_supplies')
@Index(['contractAddress', 'blockNumber']) // Index for querying by contract and block
export class TokenSupply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  contractAddress: string; // Foreign key to Token model

  @Column({ type: 'varchar', length: 255, nullable: false })
  totalSupply: string; // BigInt values stored as strings

  @Column({ type: 'int', nullable: false })
  blockNumber: number; // Block number at which the totalSupply was recorded

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
