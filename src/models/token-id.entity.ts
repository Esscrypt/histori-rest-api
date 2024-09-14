import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Token } from './token.entity';

@Entity('token_ids')
@Index(['contractAddress', 'tokenId'], { unique: true }) // Ensure contractAddress + tokenId is unique
export class TokenID {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  contractAddress: string;

  @Column({ type: 'varchar', nullable: false })
  tokenId: string;  // Token ID for ERC721 or ERC1155

  @Column({ type: 'varchar', nullable: true })
  tokenURI?: string;  // Optional: URI for metadata

  // Relationship to the Token entity
  @ManyToOne(() => Token)
  @JoinColumn({ name: 'contractAddress', referencedColumnName: 'contractAddress' })
  token: Token;
}
