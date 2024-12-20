import { Injectable, NotFoundException } from '@nestjs/common';
import { GetTokenByAddressDto } from 'src/dtos/request/get-token-by-address.dto';
import { GetTokensByNameRequestDto } from 'src/dtos/request/get-tokens-by-name-request.dto';
import { GetTokensBySymbolRequestDto } from 'src/dtos/request/get-tokens-by-symbol-request.dto';
import { GetTokensRequestDto } from 'src/dtos/request/get-tokens-request.dto';
import { PaginatedTokensResponseDto } from 'src/dtos/response/paginated-token-response.dto';
import { TokenResponseDto } from 'src/dtos/response/token-response.dto';
import { TokenDto } from 'src/dtos/token.dto';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
import { DynamicConnectionService } from 'src/services/dynamic-connection.service';
import { EthersHelperService } from 'src/services/ethers-helper.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly dynamicConnectionService: DynamicConnectionService,
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly ethersHelperService: EthersHelperService,
  ) {}

  /**
   * Get paginated list of tokens, optionally filtered by token type.
   */
  async getTokens(
    network_name: string,
    dto: GetTokensRequestDto,
  ): Promise<PaginatedTokensResponseDto> {
    const { token_type, page = 1, limit = 10 } = dto;

    const chain_id = this.supportedNetworksService.getChainId(network_name);
    const total_results = await this.getTotalTokenCount(
      network_name,
      token_type,
    );
    const offset = (page - 1) * limit;

    const tokens = await this.fetchTokensFromDb(
      network_name,
      token_type,
      limit,
      offset,
    );

    return this.createPaginatedResponse({
      network_name,
      chain_id,
      page,
      limit,
      total_results,
      tokens,
    });
  }

  /**
   * Get token details by contract address.
   */
  async getTokenByAddress(
    network_name: string,
    dto: GetTokenByAddressDto,
  ): Promise<TokenResponseDto> {
    const { token_address } = dto;
    const chain_id = this.supportedNetworksService.getChainId(network_name);

    const token = await this.fetchTokenByAddress(network_name, token_address);
    if (!token) {
      throw new NotFoundException('Token not found.');
    }

    return this.prepareTokenResponseDto(network_name, chain_id, token);
  }

  private prepareTokenResponseDto(
    network_name: string,
    chain_id: number,
    tokenDto: TokenDto,
  ): TokenResponseDto {
    const responseDto: TokenResponseDto = {
      network_name,
      chain_id,
      token_address: tokenDto.token_address,
      block_height: tokenDto.block_height,
      token_type: tokenDto.token_type,
      name: tokenDto.name,
      symbol: tokenDto.symbol,
    };

    if (tokenDto.token_type === 'erc20') {
      responseDto.decimals = tokenDto.decimals;
    }

    if (tokenDto.token_type === 'erc777') {
      responseDto.granularity = tokenDto.granularity;
    }

    return responseDto;
  }

  /**
   * Get tokens by name with pagination.
   */
  async getTokensByName(
    network_name: string,
    dto: GetTokensByNameRequestDto,
  ): Promise<PaginatedTokensResponseDto> {
    const { token_name, page = 1, limit = 10 } = dto;

    const chain_id = this.supportedNetworksService.getChainId(network_name);
    const total_results = await this.getTotalTokenCountByName(
      network_name,
      token_name,
    );
    const offset = (page - 1) * limit;

    const tokens = await this.fetchTokensByName(
      network_name,
      token_name,
      limit,
      offset,
    );

    return this.createPaginatedResponse({
      network_name,
      chain_id,
      page,
      limit,
      total_results,
      tokens,
    });
  }

  /**
   * Get tokens by symbol with pagination.
   */
  async getTokensBySymbol(
    network_name: string,
    dto: GetTokensBySymbolRequestDto,
  ): Promise<PaginatedTokensResponseDto> {
    const { token_symbol, page = 1, limit = 10 } = dto;

    const chain_id = this.supportedNetworksService.getChainId(network_name);
    const total_results = await this.getTotalTokenCountBySymbol(
      network_name,
      token_symbol,
    );
    const offset = (page - 1) * limit;

    const tokens = await this.fetchTokensBySymbol(
      network_name,
      token_symbol,
      limit,
      offset,
    );

    return this.createPaginatedResponse({
      network_name,
      chain_id,
      page,
      limit,
      total_results,
      tokens,
    });
  }

  /**
   * Fetch total token count from the database.
   */
  private async getTotalTokenCount(
    network_name: string,
    token_type?: string,
  ): Promise<number> {
    const query = token_type
      ? `SELECT COUNT(*) AS count FROM tokens WHERE "tokenType" = $1`
      : `SELECT COUNT(*) AS count FROM tokens`;
    const params = token_type ? [token_type] : [];

    const result = await this.dynamicConnectionService.executeQuery(
      network_name,
      query,
      params,
    );

    return parseInt(result.rows[0].count, 10);
  }

  private async getTotalTokenCountByName(
    network_name: string,
    token_name: string,
  ): Promise<number> {
    const query = `SELECT COUNT(*) AS count FROM tokens WHERE LOWER("name") = LOWER($1)`;
    const params = [token_name];

    const result = await this.dynamicConnectionService.executeQuery(
      network_name,
      query,
      params,
    );

    return parseInt(result.rows[0].count, 10);
  }

  private async getTotalTokenCountBySymbol(
    network_name: string,
    token_symbol: string,
  ): Promise<number> {
    const query = `SELECT COUNT(*) AS count FROM tokens WHERE LOWER("symbol") = LOWER($1)`;
    const params = [token_symbol];

    const result = await this.dynamicConnectionService.executeQuery(
      network_name,
      query,
      params,
    );

    return parseInt(result.rows[0].count, 10);
  }

  private async fetchTokensFromDb(
    network_name: string,
    token_type: string | undefined,
    limit: number,
    offset: number,
  ): Promise<TokenDto[]> {
    const query = token_type
      ? `
        SELECT *
        FROM tokens
        WHERE "tokenType" = $1
        ORDER BY "blockNumber" DESC
        LIMIT $2 OFFSET $3
      `
      : `
        SELECT *
        FROM tokens
        ORDER BY "blockNumber" DESC
        LIMIT $1 OFFSET $2
      `;
    const params = token_type ? [token_type, limit, offset] : [limit, offset];

    const result = await this.dynamicConnectionService.executeQuery(
      network_name,
      query,
      params,
    );

    return result.rows.map((row) => this.prepareTokenDto(row));
  }

  async fetchTokenByAddress(
    network_name: string,
    token_address: string,
  ): Promise<TokenDto> {
    // Step 1: Query the database for token information
    try {
      const query = `SELECT *
                     FROM tokens
                     WHERE "contractAddress" = $1
                     LIMIT 1`;
      const params = [token_address];

      const result = await this.dynamicConnectionService.executeQuery(
        network_name,
        query,
        params,
      );

      if (result.rows.length > 0) {
        return this.prepareTokenDto(result.rows[0]);
      }
    } catch (error) {
      console.error(
        `Database access error: ${error.message}. Continuing with blockchain query...`,
      );
    }

    // Step 2: Query the blockchain for token information
    try {
      const provider = await this.ethersHelperService.getProvider(network_name);
      const tokenDto = await this.ethersHelperService.queryTokenData(
        token_address,
        provider,
      );

      // Step 3: Save the fetched token information to the database
      try {
        const insertQuery = `
          INSERT INTO tokens ("contractAddress", "blockNumber", "tokenType", "name", "symbol", "decimals", "granularity")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const insertParams = [
          tokenDto.token_address,
          tokenDto.block_height,
          tokenDto.token_type,
          tokenDto.name,
          tokenDto.symbol,
          tokenDto.decimals || null,
          tokenDto.granularity || null,
        ];

        await this.dynamicConnectionService.executeQuery(
          network_name,
          insertQuery,
          insertParams,
        );
      } catch (dbSaveError) {
        console.error(`Failed to save token to DB: ${dbSaveError.message}`);
      }

      return tokenDto;
    } catch (blockchainError) {
      console.error(`Blockchain query failed: ${blockchainError.message}`);
      throw new NotFoundException(
        `Token with address ${token_address} not found.`,
      );
    }
  }

  private async fetchTokensByName(
    network_name: string,
    token_name: string,
    limit: number,
    offset: number,
  ): Promise<TokenDto[]> {
    const query = `
      SELECT *
      FROM tokens
      WHERE LOWER("name") = LOWER($1)
      ORDER BY "blockNumber" DESC
      LIMIT $2 OFFSET $3
    `;
    const params = [token_name, limit, offset];

    const result = await this.dynamicConnectionService.executeQuery(
      network_name,
      query,
      params,
    );

    return result.rows.map((row) => this.prepareTokenDto(row));
  }

  private async fetchTokensBySymbol(
    network_name: string,
    token_symbol: string,
    limit: number,
    offset: number,
  ): Promise<TokenDto[]> {
    const query = `
      SELECT *
      FROM tokens
      WHERE LOWER("symbol") = LOWER($1)
      ORDER BY "blockNumber" DESC
      LIMIT $2 OFFSET $3
    `;
    const params = [token_symbol, limit, offset];

    const result = await this.dynamicConnectionService.executeQuery(
      network_name,
      query,
      params,
    );

    return result.rows.map((row) => this.prepareTokenDto(row));
  }

  private prepareTokenDto(row: any): TokenDto {
    const dto = {
      token_address: row.contractAddress,
      block_height: row.blockNumber,
      token_type: row.tokenType,
      name: row.name,
      symbol: row.symbol,
    };
    if (row.tokenType === 'erc20') {
      dto['decimals'] = row.decimals;
    }
    if (row.tokenType === 'erc777') {
      dto['granularity'] = row.granularity;
    }
    return dto;
  }

  private createPaginatedResponse({
    network_name,
    chain_id,
    page,
    limit,
    total_results,
    tokens,
  }: {
    network_name: string;
    chain_id: number;
    page: number;
    limit: number;
    total_results: number;
    tokens: TokenDto[];
  }): PaginatedTokensResponseDto {
    const totalPages = Math.ceil(total_results / limit);

    return {
      network_name,
      chain_id,
      page,
      limit,
      total_results,
      total_pages: totalPages,
      next:
        page < totalPages
          ? `https://api.histori.xyz/v1/${network_name}/tokens?page=${page + 1}&limit=${limit}`
          : undefined,
      previous:
        page > 1
          ? `https://api.histori.xyz/v1/${network_name}/tokens?page=${page - 1}&limit=${limit}`
          : undefined,
      tokens,
    };
  }
}
