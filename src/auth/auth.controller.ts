import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response, Request, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from '../shared/decorators';

const REFRESH_TOKEN_COOKIE = 'refresh_token';
const COOKIE_SAMESITE = (process.env.COOKIE_SAMESITE ||
  'strict') as CookieOptions['sameSite'];
const COOKIE_SECURE =
  process.env.COOKIE_SECURE === 'true' ||
  process.env.NODE_ENV === 'production' ||
  COOKIE_SAMESITE === 'none';

function isLocalRequest(req: Request) {
  const origin = req.headers.origin || '';
  const host = req.headers.host || '';

  return (
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1') ||
    host.startsWith('localhost:') ||
    host.startsWith('127.0.0.1:')
  );
}

function getCookieOptions(req: Request, maxAge?: number): CookieOptions {
  const local = isLocalRequest(req);

  return {
    httpOnly: true,
    secure: local ? false : COOKIE_SECURE,
    sameSite: local ? 'strict' : COOKIE_SAMESITE,
    path: '/v1/auth',
    ...(maxAge ? { maxAge } : {}),
  };
}

@ApiTags('Auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nueva cuenta' })
  @ApiResponse({ status: 201, description: 'Cuenta creada exitosamente.' })
  @ApiResponse({ status: 409, description: 'Email ya registrado.' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);

    // Set refresh token as httpOnly cookie
    res.cookie(
      REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      getCookieOptions(req, 7 * 24 * 60 * 60 * 1000),
    );

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    res.cookie(
      REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      getCookieOptions(req, 7 * 24 * 60 * 60 * 1000),
    );

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar access token' })
  @ApiResponse({ status: 200, description: 'Tokens refrescados.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido.' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'No se encontró el refresh token.',
        code: 'MISSING_REFRESH_TOKEN',
      });
    }

    const result = await this.authService.refresh(refreshToken);

    res.cookie(
      REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      getCookieOptions(req, 7 * 24 * 60 * 60 * 1000),
    );

    return {
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 204, description: 'Sesión cerrada.' })
  async logout(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);

    // Clear the refresh token cookie
    res.clearCookie(REFRESH_TOKEN_COOKIE, getCookieOptions(req));
  }
}
