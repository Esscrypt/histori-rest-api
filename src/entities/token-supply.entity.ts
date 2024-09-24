import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Token } from './token.entity';

@Entity('token_supplies')
@Index('idx_token_supply_address', ['tokenAddress'])
@Index('idx_token_supply_block', ['blockNumber'])
export class TokenSupply {
  @PrimaryColumn({ type: 'bytea', nullable: false })
  tokenAddress: Buffer; // Token address (20 bytes)

  @PrimaryColumn({ type: 'int', nullable: false })
  blockNumber: number; // Block number at the time of the snapshot

  @Column({ type: 'bigint', nullable: false })
  totalSupply: string; // Total supply as a string to handle large values

  // Relationship to the Token entity
  @ManyToOne(() => Token)
  @JoinColumn({
    name: 'token_address',
    referencedColumnName: 'token_address',
  })
  token: Token;
}
