import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RequestTrackingMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async use(req: any, res: any, next: () => void) {
    if (req.user) {
      const user = await this.userRepository.findOne({
        where: { id: req.user.id },
      });
      if (user) {
        user.requestCount += 1;
        await this.userRepository.save(user);
      }
    }
    next();
  }
}
