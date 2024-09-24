import { Injectable, BadRequestException } from '@nestjs/common';
import { Allowance } from 'src/entities/allowance.entity';
import { Balance } from 'src/entities/balance.entity';
import { TokenID } from 'src/entities/token-id.entity';
import { TokenSupply } from 'src/entities/token-supply.entity';
import { Token } from 'src/entities/token.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class DynamicConnectionService {
  private readonly dataSourceCache: { [network: string]: DataSource } = {};

  // Helper function to retrieve environment variables dynamically based on the network name
  private getEnvVariable(network_name: string, key: string): string {
    const variable = process.env[`${key}_${network_name.toUpperCase()}`];
    if (!variable) {
      throw new BadRequestException(
        `Environment variable for ${key} not found for network ${network_name}`,
      );
    }
    return variable;
  }

  // This method initializes and returns a DataSource for a specific network
  async getDataSource(network_name: string): Promise<DataSource> {
    // If the connection for the network already exists, return it
    if (this.dataSourceCache[network_name]) {
      return this.dataSourceCache[network_name];
    }

    // Initialize a new DataSource based on the network name
    const dataSource = new DataSource({
      type: 'postgres',
      host: this.getEnvVariable(network_name, 'DB_HOST'),
      port: parseInt(this.getEnvVariable(network_name, 'DB_PORT'), 10),
      username: this.getEnvVariable(network_name, 'DB_USER'),
      password: this.getEnvVariable(network_name, 'DB_PASSWORD'),
      database: this.getEnvVariable(network_name, 'DB_DATABASE'),
      // Load all the necessary entities here for all database interactions
      entities: [Token, Balance, Allowance, User, TokenID, TokenSupply],
      synchronize: false, // Disable auto-sync for production environments
    });

    // Initialize the DataSource and cache it for future use
    await dataSource.initialize();
    this.dataSourceCache[network_name] = dataSource;

    return dataSource;
  }

  // This method returns a repository for a specific entity in the context of a network
  async getRepository<T>(
    network_name: string,
    entity: { new (): T },
  ): Promise<Repository<T>> {
    const dataSource = await this.getDataSource(network_name);
    return dataSource.getRepository(entity);
  }
}
