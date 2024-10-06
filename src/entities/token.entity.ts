import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tokens')
export class Token {
  @PrimaryColumn({ name: 'contractAddress', nullable: false })
  contractAddress: string; // Token address stored as a Buffer (20 bytes)

  @Column({ name: 'blockNumber', type: 'varchar', nullable: false })
  blockNumber: number; // Block number at the time of token creation or update

  @Column({ name: 'tokenType', type: 'varchar', nullable: false })
  tokenType: string; // Type of the token (e.g., ERC20, ERC721)

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  name?: string; // Token name (required for ERC20)

  @Column({ name: 'symbol', type: 'varchar', length: 50, nullable: true })
  symbol?: string; // Token symbol (required for ERC20)

  @Column({ name: 'decimals', type: 'smallint', nullable: true })
  decimals?: number; // Token decimals (optional for ERC20)

  @Column({ name: 'granularity', type: 'bigint', nullable: true })
  granularity?: string; // Granularity for tokens
}
