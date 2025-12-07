import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger();

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
      const payload: { sub: string } = await verifyToken(request.cookies?.['__session'], {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      
      const id: string = payload.sub;
      this.logger.log('request', id)
      request.user = {
        clerkId: id,
      }
    } catch (err) {
      this.logger.error(err);
      return false;
    }
    return true;
  }
}
