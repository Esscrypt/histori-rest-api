import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Token } from './token.entity';

@Entity('token_supplies')
@Index(['contractAddress', 'blockNumber'])  // Ensure contractAddress + blockNumber is indexed
export class TokenSupply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  contractAddress: string;  // Foreign key to Token entity

  @Column({ type: 'varchar', nullable: false })
  totalSupply: string;  // Store BigInt as string

  @Column({ type: 'int', nullable: false })
  blockNumber: number;  // Block at which totalSupply was recorded

  // Relationship to the Token entity
  @ManyToOne(() => Token)
  @JoinColumn({ name: 'contractAddress', referencedColumnName: 'contractAddress' })
  token: Token;
}
