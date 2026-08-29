import { CommentModel, IComment } from '../models/comment.model';
import { AppError } from '../middlewares/error.middleware';
import { Types } from 'mongoose';

export class CommentService {
  static async getCommentsForItem(userId: string, loggableType: string, loggableId: string): Promise<IComment[]> {
    return CommentModel.find({
      userId: new Types.ObjectId(userId),
      loggableType,
      loggableId,
    }).sort({ createdAt: 1 });
  }

  static async createComment(userId: string, data: {
    loggableType: 'session' | 'movie' | 'series' | 'episode' | 'book';
    loggableId: string;
    content: string;
    timestamp?: number | null;
    chapterOrEpisode?: string | null;
    isSpoiler?: boolean;
  }): Promise<IComment> {
    return CommentModel.create({
      userId: new Types.ObjectId(userId),
      loggableType: data.loggableType,
      loggableId: data.loggableId,
      content: data.content,
      timestamp: data.timestamp ?? null,
      chapterOrEpisode: data.chapterOrEpisode ?? null,
      isSpoiler: data.isSpoiler ?? false,
    });
  }

  static async replaceSessionComments(userId: string, sessionId: string, comments: Array<{
    content: string;
    timestamp?: number | null;
    chapterOrEpisode?: string | null;
    isSpoiler?: boolean;
  }>): Promise<IComment[]> {
    await CommentModel.deleteMany({
      userId: new Types.ObjectId(userId),
      loggableType: 'session',
      loggableId: sessionId,
    });

    if (comments.length === 0) {
      return [];
    }

    const docs = comments.map(c => ({
      userId: new Types.ObjectId(userId),
      loggableType: 'session' as const,
      loggableId: sessionId,
      content: c.content,
      timestamp: c.timestamp ?? null,
      chapterOrEpisode: c.chapterOrEpisode ?? null,
      isSpoiler: c.isSpoiler ?? false,
    }));

    return CommentModel.insertMany(docs) as unknown as Promise<IComment[]>;
  }

  static async updateComment(userId: string, commentPublicId: string, data: {
    content?: string;
    timestamp?: number | null;
    chapterOrEpisode?: string | null;
    isSpoiler?: boolean;
  }): Promise<IComment> {
    const comment = await CommentModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: commentPublicId,
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (data.content !== undefined) comment.content = data.content;
    if (data.timestamp !== undefined) comment.timestamp = data.timestamp;
    if (data.chapterOrEpisode !== undefined) comment.chapterOrEpisode = data.chapterOrEpisode;
    if (data.isSpoiler !== undefined) comment.isSpoiler = data.isSpoiler;

    return comment.save();
  }

  static async deleteComment(userId: string, commentPublicId: string): Promise<void> {
    const res = await CommentModel.deleteOne({
      userId: new Types.ObjectId(userId),
      publicId: commentPublicId,
    });

    if (res.deletedCount === 0) {
      throw new AppError('Comment not found', 404);
    }
  }
}
