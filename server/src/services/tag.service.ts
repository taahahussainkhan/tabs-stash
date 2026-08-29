import { TagModel, ITag } from '../models/tag.model';
import { AppError } from '../middlewares/error.middleware';
import { Types } from 'mongoose';

export class TagService {
  static async getAllTags(userId: string): Promise<ITag[]> {
    return TagModel.find({ userId: new Types.ObjectId(userId) }).sort({ name: 1 });
  }

  static async createTag(userId: string, data: { name: string; slug?: string; color?: string; category?: string }): Promise<ITag> {
    const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const existing = await TagModel.findOne({ userId: new Types.ObjectId(userId), slug });
    if (existing) {
      return existing;
    }

    return TagModel.create({
      userId: new Types.ObjectId(userId),
      name: data.name,
      slug,
      color: data.color || '#e05a47',
      category: data.category || 'general',
    });
  }

  static async updateTag(userId: string, tagIdOrPublicId: string, data: { name?: string; color?: string; category?: string }): Promise<ITag> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (Types.ObjectId.isValid(tagIdOrPublicId)) {
      query._id = new Types.ObjectId(tagIdOrPublicId);
    } else {
      query.publicId = tagIdOrPublicId;
    }

    const tag = await TagModel.findOne(query);
    if (!tag) {
      throw new AppError('Tag not found', 404);
    }

    if (data.name) {
      tag.name = data.name;
      tag.slug = data.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    }
    if (data.color) tag.color = data.color;
    if (data.category) tag.category = data.category;

    return tag.save();
  }

  static async deleteTag(userId: string, tagIdOrPublicId: string): Promise<void> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (Types.ObjectId.isValid(tagIdOrPublicId)) {
      query._id = new Types.ObjectId(tagIdOrPublicId);
    } else {
      query.publicId = tagIdOrPublicId;
    }

    const res = await TagModel.deleteOne(query);
    if (res.deletedCount === 0) {
      throw new AppError('Tag not found', 404);
    }
  }
}
