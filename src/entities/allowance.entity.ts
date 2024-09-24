import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Token } from './token.entity';

@Entity('allowances')
@Index('idx_owner_address', ['ownerAddress'])
@Index('idx_spender_address', ['spenderAddress'])
@Index('idx_token_address', ['tokenAddress'])
@Index('idx_block_number', ['blockNumber'])
export class Allowance {
  @PrimaryColumn({ type: 'bytea', nullable: false })
  ownerAddress: Buffer; // Owner's wallet address (20 bytes)

  @PrimaryColumn({ type: 'bytea', nullable: false })
  tokenAddress: Buffer; // Token address (20 bytes)

  @PrimaryColumn({ type: 'int', nullable: false })
  blockNumber: number; // Block number at the time of allowance

  @Column({ type: 'bytea', nullable: false })
  spenderAddress: Buffer; // Spender's wallet address (20 bytes)

  @Column({ type: 'bigint', nullable: true })
  allowance?: string; // Allowance amount, null for ERC721

  @Column({ type: 'smallint', nullable: true })
  tokenId?: number; // Optional tokenId, relevant for ERC721/ERC1155

  @Column({ type: 'varchar', length: 10, nullable: false })
  tokenType: string; // Token type, e.g., "ERC20", "ERC721"

  // Many-to-One relationship to the Token entity (token_address references token_address in tokens table)
  @ManyToOne(() => Token)
  @JoinColumn({
    name: 'token_address',
    referencedColumnName: 'token_address',
  })
  token: Token; // Reference to the Token entity
}
