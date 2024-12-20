import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import { GetNFTOwnerRequestDto } from 'src/dtos/request/get-nft-owner-request.dto';
import { GetTokenUriRequestDto } from 'src/dtos/request/get-token-uri-request.dto';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';
import axios from 'axios'; // Use Axios to fetch metadata from token URI
import { NFTOwnershipResponseDto } from 'src/dtos/response/nft-ownership-response.dto';
import { TokenUriResponseDto } from 'src/dtos/response/token-uri-response.dto';
import { ContractService } from 'src/contract/contract.service';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { NFTDto } from 'src/dtos/nft.dto';
import { GetPaginatedNFTsRequestDto } from 'src/dtos/request/get-paginated-nfts-request.dto';
import { PaginatedNFTsResponseDto } from 'src/dtos/response/paginated-nft-response.dto';

@Injectable()
export class NFTService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly contractService: ContractService,
    private readonly ethersHelperService: EthersHelperService,
  ) {}

  /**
   * Get the token URI for an ERC721 or ERC1155 token, first checking the DB.
   */
  public async getTokenUri(
    networkName: string,
    dto: GetTokenUriRequestDto,
  ): Promise<TokenUriResponseDto> {
    const { token_address, token_id } = dto;
    let tokenUri: string | null = null;

    const chainId = this.supportedNetworksService.getChainId(networkName);
    // If not found in DB or DB access failed, query the blockchain
    const provider = await this.ethersHelperService.getProvider(networkName);

    const isERC721 = await this.contractService.isContractOfType(
      token_address,
      'erc721',
      provider,
    );
    const isERC1155 = this.contractService.isContractOfType(
      token_address,
      'erc1155',
      provider,
    );

    if (!isERC721 && !isERC1155) {
      throw new BadRequestException(
        'The contract is neither ERC721 nor ERC1155',
      );
    }
    // Attempt to query the database for the token URI
    try {
      const query = `SELECT * FROM token_ids WHERE "contractAddress" = $1 AND "tokenId" = $2`;
      const params = [token_address, token_id];

      const res = await this.dynamicConnectionService.executeQuery(
        networkName,
        query,
        params,
      );

      // If found in DB, return the token URI and metadata
      if (res.rows.length > 0) {
        tokenUri = res.rows[0].tokenURI;
        if (tokenUri.startsWith('ipfs://')) {
          tokenUri = tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        return {
          network_name: networkName,
          chain_id: chainId,
          token_id: token_id,
          token_uri: tokenUri,
          metadata: await this.fetchMetadataFromUri(tokenUri),
        };
      }
    } catch (error: any) {
      console.error(
        `Database access error: ${error.message}. Continuing with blockchain query...`,
      );
      // Continue to blockchain querying if the database access fails
    }

    const contract = new ethers.Contract(
      token_address,
      [
        'function uri(uint256 id) public view returns (string)',
        'function tokenURI(uint256 tokenId) public view returns (string)',
      ],
      provider,
    );

    try {
      tokenUri = isERC1155
        ? await contract.uri(token_id)
        : await contract.tokenURI(token_id);

      // Save the token URI to the database if the blockchain query succeeds
      try {
        const insertQuery = `INSERT INTO token_ids ("contractAddress", "tokenId", "tokenURI") VALUES ($1, $2, $3)`;
        const params = [token_address, token_id, tokenUri];
        await this.dynamicConnectionService.executeQuery(
          networkName,
          insertQuery,
          params,
        );
      } catch (dbError: any) {
        console.error(`Failed to save token URI to DB: ${dbError.message}`);
        // Continue without failing since the blockchain query was successful
      }

      if (tokenUri.startsWith('ipfs://')) {
        tokenUri = tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      return {
        network_name: networkName,
        chain_id: chainId,
        token_id: token_id,
        token_uri: tokenUri,
        metadata: await this.fetchMetadataFromUri(tokenUri),
      };
    } catch (error: any) {
      console.error(`Blockchain query failed: ${error.message}`);
      throw new NotFoundException('Could not find token URI');
    }
  }

  /**
   * Fetch metadata from token URI (supporting both HTTP and IPFS), and recursively replace IPFS URIs with HTTP URLs.
   */
  private async fetchMetadataFromUri(tokenUri: string): Promise<any> {
    try {
      const response = await axios.get(tokenUri);
      const metadata = response.data;

      // Recursively replace IPFS URIs within the metadata
      return this.replaceIpfsUrisRecursively(metadata);
    } catch (error: any) {
      console.error('Failed to fetch metadata from URI:', error.message);
      throw new BadRequestException('Failed to fetch metadata from token URI');
    }
  }

  /**
   * Recursively replace IPFS URIs with HTTP URLs in the metadata object.
   */
  private replaceIpfsUrisRecursively(obj: any): any {
    if (typeof obj === 'string' && obj.startsWith('ipfs://')) {
      return obj.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.replaceIpfsUrisRecursively(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const updatedObj: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          updatedObj[key] = this.replaceIpfsUrisRecursively(obj[key]);
        }
      }
      return updatedObj;
    }

    return obj;
  }

  /**
   * Check if a specific address owns a specific token (ERC721 or ERC1155).
   */
  public async isOwnerOfToken(
    networkName: string,
    dto: GetNFTOwnerRequestDto,
  ): Promise<NFTOwnershipResponseDto> {
    const { token_address, owner, token_id, block_height, date } = dto;

    const chainId = this.supportedNetworksService.getChainId(networkName);
    // Initialize provider
    const provider = await this.ethersHelperService.getProvider(networkName);

    const isERC721 = await this.contractService.isContractOfType(
      token_address,
      'erc721',
      provider,
    );
    const isERC1155 = this.contractService.isContractOfType(
      token_address,
      'erc1155',
      provider,
    );
    if (!isERC721 && !isERC1155) {
      throw new BadRequestException(
        'The contract is must be either ERC721 or ERC1155',
      );
    }

    const finalBlockNumber = await this.ethersHelperService.getFinalBlockNumber(
      date,
      block_height,
      provider,
    );

    const checked_at_date =
      await this.ethersHelperService.convertBlockNumberToDateString(
        finalBlockNumber,
        provider,
      );

    // const contractDeploymentDetails =
    //   await this.contractService.getContractDeploymentDetails(
    //     token_address,
    //     provider,
    //   );

    // if (finalBlockNumber < contractDeploymentDetails.blockNumber) {
    //   throw new BadRequestException(
    //     `Block height must be greater than or equal to the contract deployment block number (${contractDeploymentDetails.blockNumber}).`,
    //   );
    // }

    try {
      const contract = new ethers.Contract(
        token_address,
        [
          'function balanceOf(address owner, uint256 id) public view returns (uint256)',
          'function ownerOf(uint256 tokenId) public view returns (address)',
        ],
        provider,
      );
      if (isERC721) {
        const fetchedOwner = await contract.ownerOf(token_id, {
          blockTag: block_height,
        });
        const isOwner = fetchedOwner.toLowerCase() === owner.toLowerCase();
        const responseDto: NFTOwnershipResponseDto = {
          chain_id: chainId,
          network_name: networkName,
          is_owner: isOwner,
          owner: fetchedOwner,
          token_id: token_id,
          checked_at_block: block_height,
          checked_at_date,
        };
        return responseDto;
      } else {
        const balance = await contract.balanceOf(owner, token_id, {
          blockTag: block_height,
        });
        return balance.gt(0);
      }
    } catch (error: any) {
      console.error(error);
      throw new NotFoundException('Failed to verify token ownership.');
    }
  }

  /**
   * Safe call wrapper for async operations with error handling.
   */
  private async safeCall<T>(
    operation: () => Promise<T>,
    errorMessage: string,
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      console.error(`${errorMessage}: ${error.message}`);
      return null;
    }
  }

  /**
   * Fetch a paginated list of NFTs directly from the blockchain.
   */
  async getPaginatedNFTs(
    networkName: string,
    dto: GetPaginatedNFTsRequestDto,
  ): Promise<PaginatedNFTsResponseDto> {
    const { address, page = 1, limit = 10 } = dto;

    if (!ethers.isAddress(address)) {
      throw new BadRequestException('Invalid NFT collection contract address.');
    }

    const chainId = this.supportedNetworksService.getChainId(networkName);
    const provider: ethers.JsonRpcProvider =
      await this.ethersHelperService.getProvider(networkName);

    // Initialize contract with basic ERC721/1155 functionality
    const nftContract: Contract = new ethers.Contract(
      address,
      [
        'function totalSupply() view returns (uint256)',
        'function tokenURI(uint256 tokenId) view returns (string)',
        'function ownerOf(uint256 tokenId) view returns (address)',
        'function name() view returns (string)',
        'function symbol() view returns (string)',
      ],
      provider,
    );

    // Fetch the total supply of tokens using safeCall
    const totalSupply = (await this.safeCall(
      () => nftContract.totalSupply(),
      'Failed to fetch total supply',
    )) as number;

    if (!totalSupply) {
      throw new NotFoundException(
        'Unable to fetch total supply from contract.',
      );
    }

    const totalPages = Math.ceil(totalSupply / limit);
    if (page > totalPages || page < 1) {
      throw new BadRequestException('Invalid page number.');
    }

    const offset = (page - 1) * limit;
    const endIndex = Math.min(offset + limit, totalSupply);

    const name = await this.safeCall(
      () => nftContract.name(),
      'Failed to fetch NFT name',
    );

    const symbol = await this.safeCall(
      () => nftContract.symbol(),
      'Failed to fetch NFT symbol',
    );

    const nftDtos: NFTDto[] = await Promise.all(
      Array.from({ length: endIndex - offset }, (_, idx) => offset + idx).map(
        async (tokenId) =>
          this.createNFTDto({
            tokenId,
            tokenAddress: address,
            networkName,
            name,
            symbol,
            contract: nftContract,
          }),
      ),
    );

    return {
      network_name: networkName,
      chain_id: chainId,
      page,
      limit,
      total_pages: totalPages,
      total_results: totalSupply,
      next:
        page < totalPages
          ? `https://api.histori.xyz/v1/${networkName}/nfts?address=${address}&page=${
              page + 1
            }&limit=${limit}`
          : undefined,
      previous:
        page > 1
          ? `https://api.histori.xyz/v1/${networkName}/nfts?address=${address}&page=${
              page - 1
            }&limit=${limit}`
          : undefined,
      tokens: nftDtos,
    };
  }

  /**
   * Create an NFTDto with all fields populated.
   */
  private async createNFTDto({
    name,
    symbol,
    tokenId,
    tokenAddress,
    contract,
  }: {
    tokenId: number;
    tokenAddress: string;
    networkName: string;
    name: string;
    symbol: string;
    contract: Contract;
  }): Promise<NFTDto> {
    const tokenUri = await this.safeCall(
      () => contract.tokenURI(tokenId),
      `Failed to fetch token URI for tokenId ${tokenId}`,
    );

    const metadata = tokenUri
      ? await this.safeCall(
          () => this.fetchMetadataFromUri(tokenUri),
          `Failed to fetch metadata for tokenId ${tokenId}`,
        )
      : null;

    const owner = await this.safeCall(
      () => contract.ownerOf(tokenId),
      `Failed to fetch owner for tokenId ${tokenId}`,
    );

    return {
      token_id: tokenId,
      token_address: tokenAddress,
      name: name || 'Unknown',
      symbol: symbol || 'Unknown',
      owner: owner || 'Unknown',
      token_uri: tokenUri.startsWith('ipfs://')
        ? tokenUri.replace('ipfs://', 'https://ipfs.io/ipfs/')
        : tokenUri,
      ...(metadata ? { metadata } : {}),
    };
  }
}
