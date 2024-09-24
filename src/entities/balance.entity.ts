import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Token } from './token.entity';

@Entity('balances')
@Index('idx_balance_wallet', ['walletAddress'])
@Index('idx_balance_token', ['tokenAddress'])
@Index('idx_balance_block', ['blockNumber'])
export class Balance {
  @PrimaryColumn({ type: 'bytea', nullable: false })
  walletAddress: Buffer; // Wallet address (20 bytes)

  @PrimaryColumn({ type: 'bytea', nullable: false })
  tokenAddress: Buffer; // Token address (20 bytes)

  @PrimaryColumn({ type: 'int', nullable: false })
  blockNumber: number; // Block number at the time of balance update

  @Column({ type: 'bigint', nullable: false })
  balance: string; // Balance amount as a string to handle large values

  @Column({ type: 'smallint', nullable: true })
  tokenId?: number; // Optional for ERC721 tokens

  @Column({ type: 'varchar', length: 10, nullable: false })
  tokenType: string; // e.g., "ERC20", "ERC721"

  // Relationship to the Token entity
  @ManyToOne(() => Token)
  @JoinColumn({
    name: 'tokenAddress',
    referencedColumnName: 'tokenAddress',
  })
  token: Token;
}
