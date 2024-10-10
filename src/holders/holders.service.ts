import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetHoldersRequestDto } from 'src/dtos/get-holders-request.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ethers } from 'ethers';
import { Holder } from 'src/entities/holder.entity';
import { EthersHelperService } from 'src/services/ethers-helper.service';

@Injectable()
export class HoldersService {
  constructor(
    @InjectRepository(Holder)
    private holdersRepository: Repository<Holder>,
    private readonly ethersHelperService: EthersHelperService,
    private readonly httpService: HttpService,
  ) {}

  async getHolders(
    networkName: string,
    dto: GetHoldersRequestDto,
  ): Promise<Holder[]> {
    const { tokenAddress, blockNumber, timestamp } = dto;

    // If timestamp is provided, convert it to a block number using ethers.js
    let finalBlockNumber: number;
    if (timestamp) {
      const provider = new ethers.JsonRpcProvider(
        process.env[`RPC_URL_${networkName.toUpperCase()}`],
      );
      finalBlockNumber = await this.ethersHelperService.convertToBlockNumber(
        timestamp,
        provider,
      );
    } else {
      finalBlockNumber = blockNumber;
    }

    // Query the holders table
    let holders = await this.holdersRepository.find({
      where: { tokenAddress, blockNumber: finalBlockNumber },
    });

    if (holders.length === 0) {
      // If no holders exist, call the scraper server
      await this.callScraperServer(networkName, tokenAddress);

      // Requery the database after the scraper server returns data
      holders = await this.holdersRepository.find({
        where: { tokenAddress, blockNumber: finalBlockNumber },
      });

      if (holders.length === 0) {
        throw new BadRequestException(
          'No holder data available, even after requesting the scraper.',
        );
      }
    }

    return holders;
  }

  // Call the scraper server to scrape holder data
  private async callScraperServer(networkName: string, tokenAddress: string) {
    try {
      const scraperUrl = `http://scraper-server-url/scrape-holders`;
      const response = await lastValueFrom(
        this.httpService.post(scraperUrl, {
          tokenAddress,
          networkName,
        }),
      );

      if (response.status !== 200) {
        throw new BadRequestException('Error calling scraper server');
      }
    } catch (error) {
      console.error('Failed to call scraper server:', error.message);
      throw new BadRequestException('Error contacting scraper server.');
    }
  }
}
