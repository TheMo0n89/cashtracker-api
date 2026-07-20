import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { validate as isUuid } from 'uuid';

export interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * JWT Strategy: validates the access token from the Authorization header.
 * On success, attaches { id, email } to req.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'default-secret',
    });
  }

  validate(payload: JwtPayload) {
    if (!payload?.sub || !isUuid(payload.sub)) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    return { id: payload.sub, email: payload.email };
  }
}
