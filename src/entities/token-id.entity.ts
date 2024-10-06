import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('token_ids')
@Index(['contractAddress', 'tokenId'], { unique: true }) // Unique index for quick lookup by contract and tokenId
export class TokenID {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  contractAddress: string; // Reference to the token contract

  @Column({ type: 'varchar', length: 255, nullable: false })
  tokenId: string; // Unique token ID for ERC721 or ERC1155

  @Column({ type: 'varchar', length: 255, nullable: true })
  tokenURI?: string; // Optional: Store the token URI (metadata)

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
