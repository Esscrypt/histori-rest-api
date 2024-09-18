import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';

const tierLimits = {
  Free: 5000,    // Max 5000 requests per month
  Starter: 50000,
  Growth: 300000,
  Business: 700000,
  Enterprise: 1000000,
};

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Get API key from the request headers
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }

    // Find user by API key
    const user = await this.userRepository.findOne({ where: { apiKey } });
    if (!user) {
      throw new ForbiddenException('Invalid API key');
    }

    // Get the user's request tier and limit
    const maxRequests = tierLimits[user.tier];
    if (user.requestCount >= maxRequests) {
      throw new ForbiddenException('API request limit exceeded');
    }

    // Increment the request count
    user.requestCount += 1;
    await this.userRepository.save(user);

    // Attach user to the request object for further use
    request.user = user;

    return true;
  }
}
