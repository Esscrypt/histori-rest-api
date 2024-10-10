import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { NFTService } from './nft.service';
import { GetTokenUriRequestDto } from 'src/dtos/get-token-uri-request.dto';
import { GetNFTOwnerRequestDto } from 'src/dtos/get-nft-owner-request.dto';

@ApiTags('NFT')
@Controller(':network/nft')
export class NFTController {
  constructor(private readonly nftService: NFTService) {}

  @Get('token-uri')
  @ApiOperation({ summary: 'Get token URI for an ERC721 or ERC1155 token' })
  @ApiResponse({
    status: 200,
    description: 'The token URI.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid contract or token ID.',
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async getTokenUri(
    @Param('network') networkName: string,
    @Param() dto: GetTokenUriRequestDto,
  ): Promise<string> {
    return this.nftService.getTokenUri(networkName, dto); // Replace with dynamic network if needed
  }

  @Get('owner')
  @ApiOperation({
    summary:
      'Check if the user is the owner of an NFT. Works for both ERC721 and ERC1155',
  })
  @ApiResponse({
    status: 200,
    description: 'Boolean indicating if the user is the owner of the NFT.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid contract or token ID.',
  })
  @ApiParam({
    name: 'network',
    description:
      'Blockchain network name or chain id, currently only eth-mainnet (or 1) is supported',
    example: 'eth-mainnet',
  })
  async isOwnerOfToken(
    @Param('network') networkName: string,
    @Param() dto: GetNFTOwnerRequestDto,
  ): Promise<boolean> {
    return this.nftService.isOwnerOfToken(networkName, dto); // Replace with dynamic network if needed
  }

  // @Get('owner-any')
  // async isOwnerOfAnyToken(
  //   @Param('version') version: string,
  //   @Param('networkName') networkName: string,
  //   @Param() dto: GetNFTOwnerRequestDto,
  // ): Promise<boolean> {
  //   return this.nftService.isOwnerOfAnyToken(networkName, dto); // Replace with dynamic network if needed
  // }
}
