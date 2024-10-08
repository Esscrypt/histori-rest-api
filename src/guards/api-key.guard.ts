import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

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
    console.log('Received API Key:', apiKey);

    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }

    try {
      // Find user by API key
      const user = await this.userRepository.findOne({ where: { apiKey } });
      console.log('User found:', user);

      if (!user) {
        throw new ForbiddenException('Invalid API key');
      }

      // Check the user's request tier and limit
      if (user.requestCount >= user.requestLimit) {
        throw new ForbiddenException('API request limit exceeded');
      }

      // Increment the request count
      user.requestCount += 1;
      await this.userRepository.save(user);
      console.log('User request count updated:', user.requestCount);

      // Attach user to the request object for further use
      request.user = user;
      return true;
    } catch (error) {
      console.error('Error in API Key Guard:', error);
      throw error; // Rethrow the error to maintain the guard's behavior
    }
  }
}
