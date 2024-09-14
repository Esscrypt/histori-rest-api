import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { ThrottlerGuard, ThrottlerStorageService } from '@nestjs/throttler';
import { ApiKeyTier } from '../models/user.entity';

@Injectable()
export class ApiKeyGuard extends ThrottlerGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    @Inject(ThrottlerStorageService)
    private readonly throttlerStorage: ThrottlerStorageService,
  ) {
    super(throttlerStorage);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;

    // Look up the user by API key
    const user = await this.userService.findUserByApiKey(apiKey);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid or inactive API key');
    }

    // Determine the rate limit based on API key tier
    const rateLimitConfig = this.getRateLimitConfig(user.apiKeyTier);
    this.handleThrottling(context, rateLimitConfig.limit, rateLimitConfig.ttl);

    // Optionally attach the user to the request object
    (request as any).user = user;
    return true;
  }

  // Define rate limits based on API key tier
  private getRateLimitConfig(tier: ApiKeyTier) {
    switch (tier) {
      case ApiKeyTier.BASIC:
        return { limit: 10, ttl: 60 }; // 10 requests per minute
      case ApiKeyTier.STANDARD:
        return { limit: 20, ttl: 60 }; // 20 requests per minute
      case ApiKeyTier.PRO:
        return { limit: 50, ttl: 60 }; // 50 requests per minute
      case ApiKeyTier.ENTERPRISE:
        return { limit: 100, ttl: 60 }; // 100 requests per minute
      default:
        return { limit: 10, ttl: 60 }; // Default limit for undefined tier
    }
  }

  // Method to handle throttling based on dynamic rate limits
  private async handleThrottling(context: ExecutionContext, limit: number, ttl: number) {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(context, request.ip);

    // Get the current request count from the throttler storage
    const { totalHits } = await this.throttlerStorage.getRecord(key, ttl);

    if (totalHits >= limit) {
      throw new UnauthorizedException('Rate limit exceeded');
    }

    // Add the current request to the throttler storage
    await this.throttlerStorage.addRecord(key, ttl);
  }
}
