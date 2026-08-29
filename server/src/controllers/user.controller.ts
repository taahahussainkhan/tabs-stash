import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { TagService } from '../services/tag.service';

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await UserService.getProfile(req.user!.userId);
      res.status(200).json({
        public_id: profile.publicId || profile._id?.toString(),
        email: profile.email,
        name: profile.name,
        first_name: profile.firstName,
        last_name: profile.lastName,
        username: profile.username,
        date_of_birth: profile.dateOfBirth,
        phone_number: profile.phoneNumber,
        profile_image: profile.profileImage,
        created_at: profile.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await UserService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({
        public_id: updated.publicId || updated._id?.toString(),
        email: updated.email,
        name: updated.name,
        first_name: updated.firstName,
        last_name: updated.lastName,
        username: updated.username,
        date_of_birth: updated.dateOfBirth,
        phone_number: updated.phoneNumber,
        profile_image: updated.profileImage,
        updated_at: updated.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.changePassword(
        req.user!.userId,
        req.body.currentPassword,
        req.body.newPassword
      );
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export class TagController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await TagService.getAllTags(req.user!.userId);
      res.status(200).json(tags);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tag = await TagService.createTag(req.user!.userId, req.body);
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tag = await TagService.updateTag(req.user!.userId, req.params.id as string, req.body);
      res.status(200).json(tag);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await TagService.deleteTag(req.user!.userId, req.params.id as string);
      res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
