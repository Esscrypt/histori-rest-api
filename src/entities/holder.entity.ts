import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Holder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tokenAddress: string;

  @Column()
  address: string;

  @Column()
  balance: string;

  @Column()
  blockNumber: number;
}
