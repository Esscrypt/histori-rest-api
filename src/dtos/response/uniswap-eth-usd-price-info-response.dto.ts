import { ApiProperty } from "@nestjs/swagger";

export class UniswapPriceInfoResponseDto {
    @ApiProperty({
        description: 'The blockchain network name (e.g., eth-mainnet).',
        example: 'eth-mainnet',
        })
        network_name: string;

        @ApiProperty({
        description:
            'The ID of the blockchain network (e.g., Ethereum mainnet is 1).',
        example: 1,
        })
        chain_id: number;

        @ApiProperty({
        description: 'Block number at the time of the snapshot',
        example: 21028042,
        })
        block_height: number;

        @ApiProperty({
        description: 'The current price of ETH in USD.',
        example: '$2579.623678',
        })
        price: string;
}