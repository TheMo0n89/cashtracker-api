import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    this.logger.debug(
      `Authorization header configured=${Boolean(req.headers['authorization'])}`,
    );
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.error(
        `JWT Rejection Reason: ${info?.message || info || err?.message || 'Unknown error'}`,
      );
      throw err || new UnauthorizedException('Token inválido o expirado.');
    }
    return user;
  }
}
