/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { ChainResolverService } from 'src/services/chainresolver.service';

@Injectable()
export class NetworkGuard implements CanActivate {
  constructor(private readonly chainResolverService: ChainResolverService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    const networkParam = request.params.network; // Can be either string or number

    // First, check if networkParam is a valid number
    const chainId = Number(networkParam);

    // Check if it's a valid number (chain ID)
    if (!isNaN(chainId)) {
      this.validateChainId(chainId);
    } else {
      // If it's not a number, treat it as a network name (string)
      this.validateNetworkName(networkParam);
    }

    // If all checks pass, allow the request to proceed
    return true;
  }

  /**
   * Validate the network name using ChainResolverService
   */
  private validateNetworkName(networkName: string): void {
    try {
      this.chainResolverService.getChainId(networkName); // Throws error if invalid
    } catch (error) {
      throw new BadRequestException(`Unsupported network: ${networkName}`);
    }
  }

  /**
   * Validate the chain ID using ChainResolverService
   */
  private validateChainId(chainId: number): void {
    try {
      this.chainResolverService.getNetworkName(chainId); // Throws error if invalid
    } catch (error) {
      throw new BadRequestException(`Unsupported chain ID: ${chainId}`);
    }
  }
}
