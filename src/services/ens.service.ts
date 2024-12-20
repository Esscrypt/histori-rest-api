import { Injectable, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class EnsService {
  private provider: ethers.Provider;

  constructor() {
    // Default to 'homestead' (Ethereum mainnet)
    this.provider = ethers.getDefaultProvider('homestead');
  }

  // Method to set the network dynamically
  setNetwork(network: string) {
    try {
      // Define network mapping
      const networkMapping = {
        'eth-mainnet': 'homestead',
        'eth-ropsten': 'ropsten',
        'eth-rinkeby': 'rinkeby',
        'eth-goerli': 'goerli',
        'eth-kovan': 'kovan',
      };

      // Get the correct network name for ethers.js
      const ethersNetwork = networkMapping[network];
      if (!ethersNetwork) {
        throw new BadRequestException(`Unsupported network: ${network}`);
      }

      // Create a new provider based on the selected network
      this.provider = ethers.getDefaultProvider(ethersNetwork);
    } catch (error) {
      throw new BadRequestException(`Error setting network: ${error.message}`);
    }
  }

  async resolveEnsName(ensName: string): Promise<string> {
    try {
      // Resolve the ENS name to an Ethereum address
      const address = await this.provider.resolveName(ensName);
      if (!address) {
        throw new BadRequestException(`Could not resolve ENS name: ${ensName}`);
      }
      return address;
    } catch (error) {
      throw new BadRequestException(
        `Error resolving ENS name: ${error.message}`,
      );
    }
  }
}
