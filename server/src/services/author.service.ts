import { AuthorModel, IAuthor } from '../models/author.model';
import { AppError } from '../middlewares/error.middleware';
import { Types } from 'mongoose';

export class AuthorService {
  static async getAll(userId: string): Promise<IAuthor[]> {
    return AuthorModel.find({
      $or: [{ userId: new Types.ObjectId(userId) }, { isPredefined: true }],
    }).sort({ name: 1 });
  }

  static async getById(userId: string, idOrPublicId: string): Promise<IAuthor> {
    const query: any = {
      $or: [{ userId: new Types.ObjectId(userId) }, { isPredefined: true }],
    };
    if (Types.ObjectId.isValid(idOrPublicId)) {
      query._id = new Types.ObjectId(idOrPublicId);
    } else {
      query.publicId = idOrPublicId;
    }

    const author = await AuthorModel.findOne(query);
    if (!author) {
      throw new AppError('Author not found', 404);
    }
    return author;
  }

  static async create(userId: string, data: any): Promise<IAuthor> {
    return AuthorModel.create({
      userId: new Types.ObjectId(userId),
      name: data.name,
      bio: data.bio || null,
      country: data.country || null,
      language: data.language || null,
      birthYear: data.birthYear || null,
      deathYear: data.deathYear || null,
      website: data.website || null,
      imageUrl: data.imageUrl || null,
      isPredefined: false,
    });
  }

  static async update(userId: string, idOrPublicId: string, data: any): Promise<IAuthor> {
    const author = await this.getById(userId, idOrPublicId);
    if (author.isPredefined) {
      throw new AppError('Cannot modify predefined author.', 403);
    }

    if (data.name !== undefined) author.name = data.name;
    if (data.bio !== undefined) author.bio = data.bio;
    if (data.country !== undefined) author.country = data.country;
    if (data.language !== undefined) author.language = data.language;
    if (data.birthYear !== undefined) author.birthYear = data.birthYear;
    if (data.deathYear !== undefined) author.deathYear = data.deathYear;
    if (data.website !== undefined) author.website = data.website;
    if (data.imageUrl !== undefined) author.imageUrl = data.imageUrl;

    return author.save();
  }

  static async delete(userId: string, idOrPublicId: string): Promise<void> {
    const author = await this.getById(userId, idOrPublicId);
    if (author.isPredefined) {
      throw new AppError('Cannot delete predefined author.', 403);
    }
    await AuthorModel.deleteOne({ _id: author._id });
  }
}
