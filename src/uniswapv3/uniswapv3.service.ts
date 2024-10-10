import { Injectable, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class UniswapV3Service {
  // Mapping of network names to Uniswap V3 pool addresses
  private networkToPoolAddress = {
    'eth-mainnet': '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8', // ETH/USDT pool on Ethereum mainnet
  };

  async getETHToUSDTPrice(networkName: string): Promise<string> {
    const poolAddress = this.networkToPoolAddress[networkName];

    if (!poolAddress) {
      throw new BadRequestException(`Unsupported network: ${networkName}`);
    }

    // Initialize provider for the network
    const provider = new ethers.JsonRpcProvider(
      process.env[`RPC_URL_${networkName.toUpperCase()}`],
    );

    // Initialize the Uniswap V3 pool contract
    const poolContract = new ethers.Contract(
      poolAddress,
      [
        'function slot0() public view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
      ],
      provider,
    );

    try {
      // Get the pool's current slot0 data
      const slot0 = await poolContract.slot0();
      const sqrtPriceX96 = slot0.sqrtPriceX96;

      // Convert the sqrtPriceX96 value to the ETH/USDT price
      const price = this.convertSqrtPriceX96ToPrice(sqrtPriceX96);
      return price;
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch ETH/USDT price: ${error.message}`,
      );
    }
  }

  // Helper function to convert sqrtPriceX96 to price
  private convertSqrtPriceX96ToPrice(sqrtPriceX96: bigint): string {
    // Price formula: (sqrtPriceX96 / 2^96)^2
    const price = (Number(sqrtPriceX96) / Math.pow(2, 96)) ** 2;
    return price.toString();
  }
}
