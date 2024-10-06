import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('balances')
@Index(['contractAddress', 'holder', 'tokenId', 'blockNumber']) // Index for querying balances by tokenId for NFTs
@Index(['holder', 'blockNumber']) // Index for faster querying by holder
export class Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tokenId?: string; // Optional for ERC20/ERC777, required for ERC721/ERC1155

  @Column({ type: 'varchar', length: 255, nullable: false })
  contractAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  holder: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  balance: string; // Use string to handle large BigInt values

  @Column({ type: 'int', nullable: false })
  blockNumber: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
