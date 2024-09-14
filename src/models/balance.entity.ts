import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Token } from './token.entity';

@Entity('balances')
@Index(['contractAddress', 'holder', 'tokenId', 'blockNumber'])  // Index for querying balances
@Index(['holder', 'blockNumber'])  // Index for faster querying by holder and block number
export class Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  contractAddress: string;  // Foreign key to the Token

  @Column({ type: 'varchar', nullable: true })
  tokenId?: string;  // Optional: Only applicable for ERC721/1155

  @Column({ type: 'varchar', nullable: false })
  holder: string;  // Wallet address of the holder

  @Column({ type: 'varchar', nullable: false })
  balance: string;  // Balance amount as a string to support large BigInt values

  @Column({ type: 'int', nullable: false })
  blockNumber: number;  // Block number at which this balance was recorded

  // Relationship to the Token entity
  @ManyToOne(() => Token)
  @JoinColumn({ name: 'contractAddress', referencedColumnName: 'contractAddress' })
  token: Token;
}
