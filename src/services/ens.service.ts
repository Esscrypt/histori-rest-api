import { Injectable, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class EnsService {
  private provider: ethers.Provider;

  constructor(network: string) {
    this.provider = ethers.getDefaultProvider(network); // "homestead" is the mainnet
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
