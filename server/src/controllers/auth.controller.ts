import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { parseCookies } from '../middlewares/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name || req.body.first_name || '',
        deviceName: req.body.deviceName || 'Web Dashboard',
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
      });

      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login({
        email: req.body.email,
        password: req.body.password,
        deviceName: req.body.deviceName || 'Web Dashboard',
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
      });

      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const refreshToken = req.body.refreshToken || cookies.refresh_token;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: { message: 'Refresh token required' },
        });
        return;
      }

      const result = await AuthService.refreshTokens({
        refreshToken,
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
      });

      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const refreshToken = req.body.refreshToken || cookies.refresh_token;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.getMe(req.user!.userId);
      res.status(200).json({
        success: true,
        data: result,
        public_id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      });
    } catch (error) {
      next(error);
    }
  }
}
