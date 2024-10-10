import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { GetNFTOwnerRequestDto } from 'src/dtos/get-nft-owner-request.dto';
import { GetTokenUriRequestDto } from 'src/dtos/get-token-uri-request.dto';

@Injectable()
export class NFTService {
  private ERC721_INTERFACE_ID = '0x80ac58cd';
  private ERC1155_INTERFACE_ID = '0xd9b67a26';

  /**
   * Get the token URI for an ERC721 or ERC1155 token.
   */
  public async getTokenUri(
    networkName: string,
    dto: GetTokenUriRequestDto,
  ): Promise<string> {
    const { tokenAddress, tokenId } = dto;

    // Initialize provider
    const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
      process.env[`RPC_URL_${networkName.toUpperCase()}`],
    );

    const contract = new ethers.Contract(
      tokenAddress,
      [
        'function supportsInterface(bytes4 interfaceId) public view returns (bool)',
        'function tokenURI(uint256 tokenId) external view returns (string)',
        'function uri(uint256 id) public view returns (string)',
      ],
      provider,
    );

    const isERC721 = await contract.supportsInterface(this.ERC721_INTERFACE_ID);
    const isERC1155 = await contract.supportsInterface(
      this.ERC1155_INTERFACE_ID,
    );

    if (!isERC721 && !isERC1155) {
      throw new BadRequestException(
        'The contract is neither ERC721 nor ERC1155',
      );
    }

    try {
      return isERC1155
        ? await contract.uri(tokenId)
        : await contract.tokenURI(tokenId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      throw new BadRequestException('Failed to query tokenURI');
    }
  }

  /**
   * Check if a specific address owns a specific token (ERC721 or ERC1155).
   */
  public async isOwnerOfToken(
    networkName: string,
    dto: GetNFTOwnerRequestDto,
  ): Promise<boolean> {
    const { tokenAddress, owner, tokenId } = dto;
    // Initialize provider
    const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
      process.env[`RPC_URL_${networkName.toUpperCase()}`],
    );

    const contract = new ethers.Contract(
      tokenAddress,
      [
        'function supportsInterface(bytes4 interfaceId) public view returns (bool)',
        'function balanceOf(address owner, uint256 id) public view returns (uint256)',
        'function ownerOf(uint256 tokenId) public view returns (address)',
      ],
      provider,
    );

    const isERC721 = await contract.supportsInterface(this.ERC721_INTERFACE_ID);
    const isERC1155 = await contract.supportsInterface(
      this.ERC1155_INTERFACE_ID,
    );

    if (!isERC721 && !isERC1155) {
      throw new BadRequestException(
        'The contract is neither ERC721 nor ERC1155',
      );
    }

    try {
      if (isERC721) {
        const fetchedOwner = await contract.ownerOf(tokenId);
        return fetchedOwner.toLowerCase() === owner.toLowerCase();
      } else {
        const balance = await contract.balanceOf(owner, tokenId);
        return balance.gt(0);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      throw new NotFoundException('Failed to verify token ownership');
    }
  }

  /**
   * Check if a specific address owns any token in the collection (ERC721 or ERC1155).
   */
  // public async isOwnerOfAnyToken(
  //   networkName: string,
  //   dto: GetNFTOwnerAnyRequestDto,
  // ): Promise<boolean> {
  //   const { tokenAddress, owner } = dto;
  //   // Initialize provider
  //   const provider: ethers.JsonRpcProvider = new ethers.JsonRpcProvider(
  //     process.env[`RPC_URL_${networkName.toUpperCase()}`],
  //   );

  //   const contract = new ethers.Contract(
  //     tokenAddress,
  //     [
  //       'function supportsInterface(bytes4 interfaceId) public view returns (bool)',
  //       'function balanceOf(address owner) public view returns (uint256)', // For ERC721
  //       'function balanceOf(address owner, uint256 id) public view returns (uint256)', // For ERC1155
  //     ],
  //     provider,
  //   );

  //   const isERC721 = await contract.supportsInterface(this.ERC721_INTERFACE_ID);
  //   const isERC1155 = await contract.supportsInterface(
  //     this.ERC1155_INTERFACE_ID,
  //   );

  //   if (!isERC721 && !isERC1155) {
  //     throw new BadRequestException(
  //       'The contract is neither ERC721 nor ERC1155',
  //     );
  //   }

  //   try {
  //     if (isERC721) {
  //       const balance = await contract.balanceOf(owner);
  //       return balance.gt(0);
  //     } else {
  //       // ERC1155 typically requires a token ID, here we assume tokenId 1 for simplicity
  //       for()
  //       const balance = await contract.balanceOf(owner, 1);
  //       return balance.gt(0);
  //     }
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (error: any) {
  //     throw new NotFoundException('Failed to verify token ownership');
  //   }
  // }
}
