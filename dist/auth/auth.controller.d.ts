import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, req: Request, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            timezone: string;
            provider: string;
            createdAt: Date;
        };
        accessToken: string;
    }>;
    login(dto: LoginDto, req: Request, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            timezone: string;
            provider: string;
            createdAt: Date;
        };
        accessToken: string;
    }>;
    refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>> | {
        accessToken: string;
    }>;
    logout(userId: string, req: Request, res: Response): Promise<void>;
}
