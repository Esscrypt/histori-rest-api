import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tokens')
export class Token {
  @PrimaryColumn({ type: 'bytea', nullable: false })
  tokenAddress: Buffer; // Token address stored as a Buffer (20 bytes)

  @Column({ type: 'int', nullable: false })
  blockNumber: number; // Block number at the time of token creation or update

  @Column({ type: 'varchar', nullable: false })
  tokenType: string; // Type of the token (e.g., ERC20, ERC721)

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string; // Token name (required for ERC20)

  @Column({ type: 'varchar', length: 50, nullable: false })
  symbol: string; // Token symbol (required for ERC20)

  @Column({ type: 'smallint', nullable: true })
  decimals?: number; // Token decimals (optional for ERC20)

  @Column({ type: 'bigint', nullable: true })
  granularity?: string; // Granularity for tokens
}
