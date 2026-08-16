import { UserModel, IUser } from '../models/user.model';
import { RefreshTokenModel } from '../models/refresh-token.model';
import { SecurityAuditLogModel } from '../models/audit-log.model';
import { StashedSessionModel } from '../models/session.model';
import {
  hashPassword,
  verifyPassword,
  generateRandomToken,
  hashToken,
  generateUUID,
} from '../utils/crypto';
import { signAccessToken } from '../utils/jwt';
import { AppError } from '../middlewares/error.middleware';
import { env } from '../config/env';
import { Types } from 'mongoose';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: {
    email: string;
    password: string;
    name?: string;
    deviceName?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthTokens> {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await UserModel.create({
      email: data.email,
      passwordHash,
      name: data.name || '',
      tokenVersion: 1,
    });

    const tokens = await this.issueTokenPair(user, {
      deviceName: data.deviceName,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    await SecurityAuditLogModel.create({
      userId: user._id,
      event: 'REGISTER_SUCCESS',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    return tokens;
  }

  /**
   * Authenticate user with email and password
   */
  static async login(data: {
    email: string;
    password: string;
    deviceName?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthTokens> {
    const user = await UserModel.findOne({ email: data.email });
    if (!user) {
      await SecurityAuditLogModel.create({
        event: 'LOGIN_FAILED_NO_USER',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: { email: data.email },
      });
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await verifyPassword(data.password, user.passwordHash);
    if (!isMatch) {
      await SecurityAuditLogModel.create({
        userId: user._id,
        event: 'LOGIN_FAILED_WRONG_PASSWORD',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });
      throw new AppError('Invalid email or password.', 401);
    }

    const tokens = await this.issueTokenPair(user, {
      deviceName: data.deviceName,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    await SecurityAuditLogModel.create({
      userId: user._id,
      event: 'LOGIN_SUCCESS',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    return tokens;
  }

  /**
   * Rotate refresh token and issue a fresh access token
   * Features automatic token reuse detection (revoking token family on breach)
   */
  static async refreshTokens(data: {
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = hashToken(data.refreshToken);

    const tokenDoc = await RefreshTokenModel.findOne({ tokenHash });
    if (!tokenDoc) {
      throw new AppError('Invalid refresh token.', 401);
    }

    // Check if token has been revoked - REUSE DETECTED!
    if (tokenDoc.isRevoked) {
      // Malicious replay attack detected! Revoke the entire token family
      await RefreshTokenModel.updateMany(
        { familyId: tokenDoc.familyId },
        { isRevoked: true }
      );

      await SecurityAuditLogModel.create({
        userId: tokenDoc.userId,
        event: 'TOKEN_REUSE_DETECTED',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: { familyId: tokenDoc.familyId },
      });

      throw new AppError(
        'Security Alert: Compromised refresh token reuse detected. All sessions in this chain have been revoked. Please log in again.',
        403
      );
    }

    // Check if expired
    if (new Date() > tokenDoc.expiresAt) {
      tokenDoc.isRevoked = true;
      await tokenDoc.save();
      throw new AppError('Refresh token has expired. Please log in again.', 401);
    }

    // Fetch user
    const user = await UserModel.findById(tokenDoc.userId);
    if (!user) {
      throw new AppError('User not found.', 401);
    }

    // Mark current refresh token as revoked (used)
    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    // Issue new refresh token in the SAME family
    const rawRefreshToken = generateRandomToken(64);
    const newRefreshTokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_DAYS);

    await RefreshTokenModel.create({
      userId: user._id,
      tokenHash: newRefreshTokenHash,
      familyId: tokenDoc.familyId,
      deviceName: tokenDoc.deviceName,
      userAgent: data.userAgent || tokenDoc.userAgent,
      ipAddress: data.ipAddress || tokenDoc.ipAddress,
      isRevoked: false,
      expiresAt,
    });

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * Log out - revoke current refresh token
   */
  static async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await RefreshTokenModel.updateOne({ tokenHash }, { isRevoked: true });
  }

  /**
   * Get user profile and account statistics
   */
  static async getMe(userId: string) {
    const user = await UserModel.findById(userId).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const sessionsCount = await StashedSessionModel.countDocuments({
      userId: new Types.ObjectId(userId),
      deletedAt: null,
    });

    const sessions = await StashedSessionModel.find({
      userId: new Types.ObjectId(userId),
      deletedAt: null,
    }).select('tabs');

    const totalTabsCount = sessions.reduce((acc, s) => acc + (s.tabs ? s.tabs.length : 0), 0);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      stats: {
        sessionsCount,
        totalTabsCount,
      },
    };
  }

  /**
   * Internal Helper: Issue token pair and register refresh token in MongoDB
   */
  private static async issueTokenPair(
    user: IUser,
    meta: { deviceName?: string; ipAddress?: string; userAgent?: string }
  ): Promise<AuthTokens> {
    const rawRefreshToken = generateRandomToken(64);
    const tokenHash = hashToken(rawRefreshToken);
    const familyId = generateUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_DAYS);

    await RefreshTokenModel.create({
      userId: user._id,
      tokenHash,
      familyId,
      deviceName: meta.deviceName || 'Browser Extension',
      userAgent: meta.userAgent || '',
      ipAddress: meta.ipAddress || '',
      isRevoked: false,
      expiresAt,
    });

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || '',
      },
    };
  }
}
