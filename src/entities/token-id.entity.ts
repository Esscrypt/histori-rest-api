import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Token } from './token.entity';

@Entity('token_ids')
@Index('idx_token_ids_contract_address', ['contractAddress'])
@Index('idx_token_ids_token_id', ['tokenId'])
export class TokenID {
  @PrimaryColumn({ type: 'bytea', nullable: false })
  contractAddress: Buffer; // Contract address (20 bytes)

  @PrimaryColumn({ type: 'smallint', nullable: false })
  tokenId: number; // Token ID for ERC721/1155 tokens

  @Column({ type: 'varchar', length: 255, nullable: true })
  tokenUri?: string; // Optional: URI for the token metadata

  // Relationship to the Token entity
  @ManyToOne(() => Token)
  @JoinColumn({
    name: 'contract_address',
    referencedColumnName: 'token_address',
  })
  token: Token;
}
