import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ChainResolverService {
  // Statically mapped list of network names to chain IDs
  private readonly networkToChainId = {
    'eth-mainnet': 1,
  };

  /**
   * Get chain ID from network name
   * @param networkName string
   * @returns number
   */
  getChainId(networkName: string): number {
    const chainId = this.networkToChainId[networkName.toLowerCase()];
    if (!chainId) {
      throw new BadRequestException(`Invalid network name: ${networkName}`);
    }
    return chainId;
  }

  /**
   * Get network name from chain ID
   * @param chainId number
   * @returns string
   */
  getNetworkName(chainId: number): string {
    const networkName = Object.keys(this.networkToChainId).find(
      (key) => this.networkToChainId[key] === chainId,
    );
    if (!networkName) {
      throw new BadRequestException(`Invalid chain ID: ${chainId}`);
    }
    return networkName;
  }
}
