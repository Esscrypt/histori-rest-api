// contract.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { ethers } from 'ethers';
import { EthersHelperService } from 'src/services/ethers-helper.service';

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);
  constructor(private ethersHelperService: EthersHelperService) {}
  // Function to determine if a contract implements a specific ERC standard

  public async isContractOfType(
    contractAddress: string,
    type: string,
    provider: ethers.JsonRpcProvider,
  ): Promise<boolean> {
    // Define the appropriate interface identifiers for each type (excluding ERC20 since it doesn't use supportsInterface)
    const interfaceIds = {
      erc721: '0x80ac58cd', // ERC721 interface ID
      erc1155: '0xd9b67a26', // ERC1155 interface ID
      erc777: '0xe58e113c', // ERC777 interface ID
    };

    try {
      // For ERC20 tokens, check if it has the 'decimals' function, which is standard for ERC20 contracts
      if (type === 'erc20') {
        const contract = new ethers.Contract(
          contractAddress,
          ['function decimals() view returns (uint8)'],
          provider,
        );

        // Try calling decimals() to verify if the contract is ERC20
        try {
          await contract.decimals();
          return true; // It's an ERC20 contract if decimals() exists
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: any) {
          console.error(`Contract does not have decimals() method. Not ERC20.`);
          return false;
        }
      }

      // For other types (ERC721, ERC1155, ERC777), use supportsInterface
      const contract = new ethers.Contract(
        contractAddress,
        [
          'function supportsInterface(bytes4 interfaceID) external view returns (bool)',
        ],
        provider,
      );

      const interfaceId = interfaceIds[type];
      if (!interfaceId) {
        throw new BadRequestException('Invalid contract type specified.');
      }

      // Check if the contract supports the specified interface ID
      const supportsInterface = await contract.supportsInterface(interfaceId);
      return supportsInterface;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      return false;
    }
  }

  public async getTokenType(
    contractAddress: string,
    provider: ethers.JsonRpcProvider,
  ): Promise<'erc20' | 'erc721' | 'erc1155' | 'erc777'> {
    // Interface IDs for the supported token types
    const interfaceIds = {
      erc721: '0x80ac58cd', // ERC721 interface ID
      erc1155: '0xd9b67a26', // ERC1155 interface ID
      erc777: '0xe58e113c', // ERC777 interface ID
    };

    try {
      // Check for ERC20 by querying the decimals() function
      const erc20Contract = new ethers.Contract(
        contractAddress,
        [
          'function decimals() view returns (uint8)', // ERC20 function to check
        ],
        provider,
      );

      // Try calling decimals(), which is typical of ERC20 tokens
      try {
        await erc20Contract.decimals();
        return 'erc20'; // If decimals() exists, it's an ERC20
      } catch (error) {
        console.warn(`ERC20 check (decimals) failed: ${error.message}`);
      }

      // Check for other token standards (ERC721, ERC1155, ERC777) using supportsInterface
      const contract = new ethers.Contract(
        contractAddress,
        [
          'function supportsInterface(bytes4 interfaceID) external view returns (bool)',
        ],
        provider,
      );

      for (const [type, interfaceId] of Object.entries(interfaceIds)) {
        try {
          // Attempt to check if the contract supports the interface
          const isSupported = await contract.supportsInterface(interfaceId);
          if (isSupported) {
            return type as 'erc721' | 'erc1155' | 'erc777';
          }
        } catch (error) {
          console.warn(
            `supportsInterface check failed for ${type}: ${error.message}`,
          );
        }
      }

      // If no token type matches, throw an error
      throw new NotFoundException('Token type could not be determined.');
    } catch (error) {
      console.error(`Failed to determine token type: ${error.message}`);
      throw new NotFoundException('Unable to determine the token type.');
    }
  }

  async getMerkleInclusionProof({
    address,
    storageKeys,
    blockNumber,
    provider,
  }: {
    address: string;
    storageKeys: string[];
    blockNumber?: number;
    provider: ethers.JsonRpcProvider;
  }): Promise<any> {
    try {
      // Use eth_getProof RPC call
      const params = [
        address,
        storageKeys,
        '0x' + blockNumber.toString(16), // Convert block number to hex
      ];

      this.logger.log(params);
      const proof = await provider.send('eth_getProof', params);

      this.logger.log(proof);

      // Process the proof data to match the desired structure
      // proof.storageProof.map((item: any) => ({
      //   key: item.key,
      //   value: item.value,
      //   proof: item.proof,
      // }));
      return proof;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      this.logger.error(
        `Failed to fetch Merkle inclusion proof: ${error.message}`,
      );
      throw new BadRequestException('Failed to fetch Merkle inclusion proof.');
    }
  }
}
