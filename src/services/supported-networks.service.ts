import { Injectable, BadRequestException } from '@nestjs/common';
import networks from 'networks.json'; // Assuming networks.json is in src/config directory

@Injectable()
export class SupportedNetworksService {
  private readonly networkMap: Record<string, number>;
  private readonly endpointsByNetwork: Record<string, string[]>;

  constructor() {
    // Map networkId to chainId from the JSON
    this.networkMap = networks.reduce(
      (acc, network) => {
        acc[network.networkId.toLowerCase()] = network.chainId;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Define the endpoint whitelist by network
    this.endpointsByNetwork = {
      tokens: ['eth-mainnet'],
      'tokens/by-symbol': ['eth-mainnet'],
      'tokens/by-name': ['eth-mainnet'],
    };
  }

  /**
   * Get chain ID from network name
   * @param networkName string
   * @returns number
   */
  getChainId(networkName: string): number {
    const chainId = this.networkMap[networkName.toLowerCase()];
    if (!chainId) {
      throw new BadRequestException(`Invalid network name: ${networkName}`);
    }
    return chainId;
  }

  getUSDCTokenAddress(networkName: string): string | undefined {
    const network = networks.find(
      (network) =>
        network.networkId.toLowerCase() === networkName.toLowerCase(),
    );
    return network?.USDCAddress;
  }

  getUSDTTokenAddress(networkName: string): string | undefined {
    const network = networks.find(
      (network) =>
        network.networkId.toLowerCase() === networkName.toLowerCase(),
    );
    return network?.USDTAddress;
  }
  /**
   * Get network name from chain ID
   * @param chainId number
   * @returns string
   */
  getNetworkName(chainId: number): string {
    const networkName = Object.keys(this.networkMap).find(
      (key) => this.networkMap[key] === chainId,
    );
    if (!networkName) {
      throw new BadRequestException(`Invalid chain ID: ${chainId}`);
    }
    return networkName;
  }

  /**
   * Check if the endpoint is supported for the specified network
   * @param endpoint string
   * @param networkName string
   * @returns boolean
   */
  isEndpointSupported(endpoint: string, networkName: string): boolean {
    const allowedNetworks = this.endpointsByNetwork[endpoint.toLowerCase()];

    // Default to true if the network is not explicitly whitelisted
    if (!allowedNetworks) {
      return true;
    }

    return allowedNetworks.includes(networkName.toLowerCase());
  }
}
