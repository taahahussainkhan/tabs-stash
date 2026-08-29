import { GenreModel, IGenre } from '../models/genre.model';
import { PublisherModel, IPublisher } from '../models/publisher.model';
import { StoreModel, IStore } from '../models/store.model';
import { AppError } from '../middlewares/error.middleware';
import { Types } from 'mongoose';

export class GenreService {
  static async getAll(userId: string): Promise<IGenre[]> {
    return GenreModel.find({
      $or: [{ userId: new Types.ObjectId(userId) }, { userId: null }],
    }).sort({ name: 1 });
  }

  static async create(userId: string, data: { name: string; slug?: string }): Promise<IGenre> {
    const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const existing = await GenreModel.findOne({
      $or: [{ userId: new Types.ObjectId(userId) }, { userId: null }],
      slug,
    });
    if (existing) return existing;

    return GenreModel.create({
      userId: new Types.ObjectId(userId),
      name: data.name,
      slug,
    });
  }

  static async delete(userId: string, idOrPublicId: string): Promise<void> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (Types.ObjectId.isValid(idOrPublicId)) query._id = new Types.ObjectId(idOrPublicId);
    else query.publicId = idOrPublicId;

    const res = await GenreModel.deleteOne(query);
    if (res.deletedCount === 0) throw new AppError('Genre not found or cannot be deleted', 404);
  }
}

export class PublisherService {
  static async getAll(userId: string): Promise<IPublisher[]> {
    return PublisherModel.find({
      $or: [{ userId: new Types.ObjectId(userId) }, { isPredefined: true }],
    }).sort({ name: 1 });
  }

  static async create(userId: string, data: any): Promise<IPublisher> {
    return PublisherModel.create({
      userId: new Types.ObjectId(userId),
      name: data.name,
      country: data.country || null,
      foundedYear: data.foundedYear || null,
      website: data.website || null,
      description: data.description || null,
      isPredefined: false,
    });
  }

  static async update(userId: string, idOrPublicId: string, data: any): Promise<IPublisher> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (Types.ObjectId.isValid(idOrPublicId)) query._id = new Types.ObjectId(idOrPublicId);
    else query.publicId = idOrPublicId;

    const pub = await PublisherModel.findOne(query);
    if (!pub) throw new AppError('Publisher not found', 404);

    if (data.name !== undefined) pub.name = data.name;
    if (data.country !== undefined) pub.country = data.country;
    if (data.foundedYear !== undefined) pub.foundedYear = data.foundedYear;
    if (data.website !== undefined) pub.website = data.website;
    if (data.description !== undefined) pub.description = data.description;

    return pub.save();
  }

  static async delete(userId: string, idOrPublicId: string): Promise<void> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (Types.ObjectId.isValid(idOrPublicId)) query._id = new Types.ObjectId(idOrPublicId);
    else query.publicId = idOrPublicId;

    const res = await PublisherModel.deleteOne(query);
    if (res.deletedCount === 0) throw new AppError('Publisher not found or cannot be deleted', 404);
  }
}

export class StoreService {
  static async getAll(userId: string): Promise<IStore[]> {
    return StoreModel.find({ userId: new Types.ObjectId(userId) }).sort({ name: 1 });
  }

  static async create(userId: string, data: { name: string; type?: 'OnlineOnly' | 'PhysicalOnly' | 'Hybrid' }): Promise<IStore> {
    return StoreModel.create({
      userId: new Types.ObjectId(userId),
      name: data.name,
      type: data.type || 'Hybrid',
    });
  }

  static async update(userId: string, idOrPublicId: string, data: any): Promise<IStore> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (Types.ObjectId.isValid(idOrPublicId)) query._id = new Types.ObjectId(idOrPublicId);
    else query.publicId = idOrPublicId;

    const store = await StoreModel.findOne(query);
    if (!store) throw new AppError('Store not found', 404);

    if (data.name !== undefined) store.name = data.name;
    if (data.type !== undefined) store.type = data.type;

    return store.save();
  }

  static async delete(userId: string, idOrPublicId: string): Promise<void> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (Types.ObjectId.isValid(idOrPublicId)) query._id = new Types.ObjectId(idOrPublicId);
    else query.publicId = idOrPublicId;

    const res = await StoreModel.deleteOne(query);
    if (res.deletedCount === 0) throw new AppError('Store not found', 404);
  }
}
