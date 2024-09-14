import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

// The Allowance entity definition
@Entity('allowances')
@Index(['contractAddress', 'owner', 'spender', 'blockNumber']) // Composite index for historical querying
@Index(['contractAddress', 'owner', 'tokenId', 'blockNumber']) // Index for querying by tokenId (ERC721/ERC1155)
export class Allowance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  contractAddress: string;

  @Column({ type: 'varchar', nullable: false })
  owner: string;

  @Column({ type: 'varchar', nullable: false })
  spender: string;

  @Column({ type: 'varchar', nullable: true })
  allowance?: string;  // Optional: Only relevant for ERC20/ERC777

  @Column({ type: 'int', nullable: false })
  blockNumber: number;

  @Column({
    type: 'enum',
    enum: ['erc20', 'erc721', 'erc777', 'erc1155'],
    nullable: false,
  })
  tokenType: string;  // Type of token

  @Column({ type: 'varchar', nullable: true })
  tokenId?: string;  // Optional: Only relevant for ERC721/ERC1155
}
