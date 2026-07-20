import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto';
import {
  EmailAlreadyExistsException,
  InvalidCredentialsException,
} from '../shared/exceptions';

/**
 * AuthService handles registration, login, token refresh, and logout.
 *
 * - Passwords are hashed with bcrypt (12 rounds).
 * - Access tokens are short-lived JWTs (8h).
 * - Refresh tokens are longer-lived JWTs (7d) stored in memory for invalidation.
 * - Refresh tokens are sent via httpOnly cookies (not localStorage).
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly memoryCache = new Map<string, string>();
  private readonly BCRYPT_ROUNDS = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new EmailAlreadyExistsException();

    const hashedPassword = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    this.logger.log(`User registered: ${user.email}`);

    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new InvalidCredentialsException();

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new InvalidCredentialsException();

    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const storedToken =
        this.memoryCache.get(`refresh_token:${payload.sub}`) || null;

      if (!storedToken || storedToken !== refreshToken) {
        throw new InvalidCredentialsException();
      }

      const tokens = await this.generateTokens(payload.sub, payload.email);
      await this.storeRefreshToken(payload.sub, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch {
      throw new InvalidCredentialsException();
    }
  }

  async logout(userId: string): Promise<void> {
    this.memoryCache.delete(`refresh_token:${userId}`);
    this.logger.log(`User logged out: ${userId}`);
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('jwt.secret') || 'default-secret',
        expiresIn: (this.configService.get<string>('jwt.accessExpiration') ||
          '8h') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('jwt.refreshSecret') ||
          'default-refresh-secret',
        expiresIn: (this.configService.get<string>('jwt.refreshExpiration') ||
          '7d') as any,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const ttlMs = this.configService.get<number>('jwt.refreshExpirationMs');
    const ttlSeconds = Math.floor((ttlMs ?? 604800000) / 1000);

    // Guardar en memoria
    this.memoryCache.set(`refresh_token:${userId}`, refreshToken);
    // Cleanup de la memoria
    setTimeout(
      () => {
        if (this.memoryCache.get(`refresh_token:${userId}`) === refreshToken) {
          this.memoryCache.delete(`refresh_token:${userId}`);
        }
      },
      ttlSeconds * 1000 || 604800000,
    );
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string;
    timezone: string;
    provider: string;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      timezone: user.timezone,
      provider: user.provider,
      createdAt: user.createdAt,
    };
  }
}
