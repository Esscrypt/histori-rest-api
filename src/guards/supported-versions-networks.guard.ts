import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class VersionAndNetworkGuard implements CanActivate {
  // Define the supported versions and networks
  private readonly supportedVersions = ['v1'];
  private readonly supportedNetworks = ['eth-mainnet'];

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    // Extract version and network_name from the route params
    const version = request.params.version;
    const networkName = request.params.network_name;

    // Check if the version is supported
    if (!this.supportedVersions.includes(version)) {
      throw new BadRequestException(`Unsupported API version: ${version}`);
    }

    // Check if the network is supported
    if (!this.supportedNetworks.includes(networkName)) {
      throw new BadRequestException(`Unsupported network: ${networkName}`);
    }

    // If both checks pass, the request can proceed
    return true;
  }
}
