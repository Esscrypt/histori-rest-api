import { Injectable, BadRequestException } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { SupportedNetworksService } from './supported-networks.service';

@Injectable()
export class DynamicConnectionService {
  private readonly poolCache: { [network: string]: Pool } = {};

  constructor(private readonly supportedNetworksService: SupportedNetworksService) {}

  // Helper function to retrieve environment variables dynamically based on the network name
  private getEnvVariable(chainId: number, key: string): string {
    const variable = process.env[`${key}_${chainId}`];
    if (!variable) {
      throw new BadRequestException(
        `Environment variable for ${key} not found for chain Id: ${chainId}`,
      );
    }
    return variable;
  }

  // This method initializes and returns a PostgreSQL Pool (pg) for a specific network
  async getPool(network_name: string): Promise<Pool> {
    // If the pool for the network already exists, return it
    if (this.poolCache[network_name]) {
      return this.poolCache[network_name];
    }

    const chainId = await this.supportedNetworksService.getChainId(network_name);

    // Initialize a new Pool based on the network name
    const pool = new Pool({
      host: this.getEnvVariable(chainId, 'DB_HOST'),
      port: parseInt(this.getEnvVariable(chainId, 'DB_PORT'), 10),
      user: this.getEnvVariable(chainId, 'DB_USER'),
      password: this.getEnvVariable(chainId, 'DB_PASSWORD'),
      database: this.getEnvVariable(chainId, 'DB_DATABASE'),
    });

    // Cache the Pool for future use
    this.poolCache[network_name] = pool;

    return pool;
  }

  // This method executes a raw SQL query in the context of a specific network
  async executeQuery(
    network_name: string,
    query: string,
    params?: any[],
  ): Promise<QueryResult> {
    const pool = await this.getPool(network_name);
    return pool.query(query, params);
  }
}
