import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NFTService } from './nft.service';
import { GetTokenUriRequestDto } from 'src/dtos/request/get-token-uri-request.dto';
import { GetNFTOwnerRequestDto } from 'src/dtos/request/get-nft-owner-request.dto';
import { NFTOwnershipResponseDto } from 'src/dtos/response/nft-ownership-response.dto';
import { TokenUriResponseDto } from 'src/dtos/response/token-uri-response.dto';
import { PaginatedNFTsResponseDto } from 'src/dtos/response/paginated-nft-response.dto';
import { GetPaginatedNFTsRequestDto } from 'src/dtos/request/get-paginated-nfts-request.dto';

@ApiTags('NFT')
@Controller(':network/nft')
export class NFTController {
  constructor(private readonly nftService: NFTService) {}

  @Get('token-uri')
  @ApiOperation({ summary: 'Get token URI for an ERC721 or ERC1155 token' })
  @ApiResponse({
    status: 200,
    description: 'The token URI and metadata.',
    type: TokenUriResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Could not find token URI.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid contract or token ID.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'projectId',
    description:
      'The id of your project. Can be found in your Histori dashboard.',
    example: '8ry9f6t9dct1se2hlagxnd9n2a',
    required: true,
    type: 'string',
  })
  async getTokenUri(
    @Param('network') networkName: string,
    @Query() dto: GetTokenUriRequestDto,
  ): Promise<TokenUriResponseDto> {
    return this.nftService.getTokenUri(networkName, dto); // Replace with dynamic network if needed
  }

  @Get('is-owner')
  @ApiOperation({
    summary:
      'Check if the user is the owner of an NFT. Works for both ERC721 and ERC1155',
  })
  @ApiResponse({
    status: 200,
    description: 'Boolean indicating if the user is the owner of the NFT.',
    type: NFTOwnershipResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid contract or token ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Failed to verify token ownership.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'projectId',
    description:
      'The id of your project. Can be found in your Histori dashboard.',
    example: '8ry9f6t9dct1se2hlagxnd9n2a',
    required: true,
    type: 'string',
  })
  async isOwnerOfToken(
    @Param('network') networkName: string,
    @Query() dto: GetNFTOwnerRequestDto,
  ): Promise<NFTOwnershipResponseDto> {
    return this.nftService.isOwnerOfToken(networkName, dto); // Replace with dynamic network if needed
  }

  @Get('by-address')
  @ApiOperation({
    summary:
      'Get Paginated NFTs for a given Collection contract address, including metadata for all NFTs (where available).',
  })
  @ApiResponse({
    status: 200,
    description: 'Boolean indicating if the user is the owner of the NFT.',
    type: PaginatedNFTsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Address is not a valid nft collection contract.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'projectId',
    description:
      'The id of your project. Can be found in your Histori dashboard.',
    example: '8ry9f6t9dct1se2hlagxnd9n2a',
    required: true,
    type: 'string',
  })
  async getPaginatedNFTs(
    @Param('network') networkName: string,
    @Query() dto: GetPaginatedNFTsRequestDto,
  ): Promise<PaginatedNFTsResponseDto> {
    return this.nftService.getPaginatedNFTs(networkName, dto); // Replace with dynamic network if needed
  }
}
