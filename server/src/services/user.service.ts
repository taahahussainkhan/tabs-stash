import bcrypt from 'bcryptjs';
import { UserModel, IUser } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { Types } from 'mongoose';

export class UserService {
  static async getProfile(userId: string): Promise<Partial<IUser>> {
    const user = await UserModel.findById(userId).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    name?: string;
    username?: string;
    dateOfBirth?: string | null;
    phoneNumber?: string;
    profileImage?: string;
  }): Promise<Partial<IUser>> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (data.username && data.username !== user.username) {
      const existing = await UserModel.findOne({ username: data.username.toLowerCase(), _id: { $ne: user._id } });
      if (existing) {
        throw new AppError('Username is already taken.', 400);
      }
      user.username = data.username.toLowerCase();
    }

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.name !== undefined) user.name = data.name;
    if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
    if (data.profileImage !== undefined) user.profileImage = data.profileImage;
    if (data.dateOfBirth !== undefined) {
      user.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }

    await user.save();
    return UserModel.findById(userId).select('-passwordHash') as unknown as Partial<IUser>;
  }

  static async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect.', 400);
    }

    const isSame = await bcrypt.compare(newPass, user.passwordHash);
    if (isSame) {
      throw new AppError('New password must be different from current password.', 400);
    }

    user.passwordHash = await bcrypt.hash(newPass, 12);
    user.lastPasswordUpdate = new Date();
    user.tokenVersion += 1; // Invalidate old JWT tokens
    await user.save();
  }
}
