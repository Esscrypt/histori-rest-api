import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity('tokens')
@Index(['contractAddress', 'tokenType'])
export class Token {
  @PrimaryColumn({ type: 'varchar' })
  contractAddress: string;  // Primary key for the Token

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  symbol: string;

  @Column({ type: 'int', nullable: true })
  decimals?: number;  // Optional: Not required for ERC721/1155

  @Column({ type: 'varchar', nullable: true })
  totalSupply?: string;  // Optional: Not required for ERC721/1155

  @Column({ type: 'int', nullable: false })
  blockNumber: number;  // Block number when the token was created

  @Column({
    type: 'enum',
    enum: ['erc20', 'erc721', 'erc777', 'erc1155'],  // Enum for token types
    nullable: false,
  })
  tokenType: string;  // Token type to distinguish between ERC standards
}
