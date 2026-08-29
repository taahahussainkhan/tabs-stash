import { MovieModel, IMovie } from '../models/movie.model';
import { MediaSessionModel, IMediaSession } from '../models/media-session.model';
import { ActivityLogModel } from '../models/activity-log.model';
import { AppError } from '../middlewares/error.middleware';
import { Types } from 'mongoose';

export interface PaginatedMoviesResult {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class MovieService {
  static async getPaginatedMovies(userId: string, options: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    status?: string;
    director?: string;
    genre?: string;
    platform?: string;
    yearMin?: number;
    yearMax?: number;
    ratingMin?: number;
    ratingMax?: number;
    isFavorite?: boolean;
    isWatchlist?: boolean;
  }): Promise<PaginatedMoviesResult> {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 10));
    const skip = (page - 1) * pageSize;

    const filter: any = { userId: new Types.ObjectId(userId) };

    if (options.isFavorite !== undefined) filter.isFavorite = options.isFavorite;
    if (options.isWatchlist !== undefined) filter.isWatchlist = options.isWatchlist;
    if (options.director) filter.director = new RegExp(options.director, 'i');
    if (options.genre) filter.genre = new RegExp(options.genre, 'i');
    if (options.platform) filter.platform = new RegExp(options.platform, 'i');

    if (options.yearMin !== undefined || options.yearMax !== undefined) {
      filter.year = {};
      if (options.yearMin !== undefined) filter.year.$gte = options.yearMin;
      if (options.yearMax !== undefined) filter.year.$lte = options.yearMax;
    }

    if (options.search) {
      const searchRegex = new RegExp(options.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { director: searchRegex },
        { genre: searchRegex },
      ];
    }

    const sortField = options.sortBy || 'updatedAt';
    const sortDir = options.sortOrder === 'asc' ? 1 : -1;
    const sortObj: any = { [sortField]: sortDir };

    const total = await MovieModel.countDocuments(filter);
    const movies = await MovieModel.find(filter)
      .populate('currentSessionId')
      .populate('tags')
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize);

    // If filtering by session status or rating, we can filter or post-process if needed
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items: movies,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  static async getStats(userId: string): Promise<Record<string, number>> {
    const uId = new Types.ObjectId(userId);
    const total = await MovieModel.countDocuments({ userId: uId });
    const favorites = await MovieModel.countDocuments({ userId: uId, isFavorite: true });
    const watchlist = await MovieModel.countDocuments({ userId: uId, isWatchlist: true });

    const watching = await MediaSessionModel.countDocuments({
      userId: uId,
      mediaType: 'movie',
      status: 'watching',
    });

    const completed = await MediaSessionModel.countDocuments({
      userId: uId,
      mediaType: 'movie',
      status: 'completed',
    });

    return {
      total,
      watching,
      completed,
      watchlist,
      favorites,
    };
  }

  static async checkExists(userId: string, title: string): Promise<{ exists: boolean; status?: string; movie?: IMovie }> {
    const movie = await MovieModel.findOne({
      userId: new Types.ObjectId(userId),
      title: new RegExp(`^${title.trim()}$`, 'i'),
    }).populate('currentSessionId');

    if (!movie) {
      return { exists: false };
    }

    const session = movie.currentSessionId as unknown as IMediaSession;
    return {
      exists: true,
      status: session ? session.status : (movie.isWatchlist ? 'watchlist' : 'logged'),
      movie,
    };
  }

  static async getMovieWithSessions(userId: string, moviePublicId: string): Promise<{
    movie: IMovie;
    sessions: IMediaSession[];
    current_session: IMediaSession | null;
    rewatch_count: number;
  }> {
    const movie = await MovieModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: moviePublicId,
    }).populate('tags').populate('linkedTabSessions');

    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    const sessions = await MediaSessionModel.find({
      userId: new Types.ObjectId(userId),
      mediaType: 'movie',
      mediaId: movie._id,
    }).sort({ startDate: -1 });

    const currentSession = movie.currentSessionId
      ? await MediaSessionModel.findById(movie.currentSessionId)
      : (sessions.length > 0 ? sessions[0] : null);

    const rewatchCount = sessions.filter(s => s.isRewatch).length;

    return {
      movie,
      sessions,
      current_session: currentSession,
      rewatch_count: rewatchCount,
    };
  }

  static async createMovieWithSession(userId: string, data: any): Promise<any> {
    const uId = new Types.ObjectId(userId);

    const check = await this.checkExists(userId, data.title);
    if (check.exists) {
      throw new AppError(`Movie '${data.title}' already exists with status: ${check.status}`, 400);
    }

    const movie = new MovieModel({
      userId: uId,
      title: data.title,
      director: data.director || null,
      year: data.year || null,
      genre: data.genre || null,
      posterImage: data.posterImage || null,
      platform: data.platform || null,
      durationMinutes: data.durationMinutes || null,
      isFavorite: data.isFavorite || false,
      isWatchlist: data.isWatchlist || false,
      linkedTabSessions: data.linkedTabSessions || [],
      referenceUrls: data.referenceUrls || [],
      tags: data.tags || [],
    });

    await movie.save();

    // Create initial session
    const session = await MediaSessionModel.create({
      userId: uId,
      mediaType: 'movie',
      mediaId: movie._id,
      status: data.status || 'watching',
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
      currentPosition: data.currentTimestamp || 0,
      stopReason: data.stopReason || null,
      isRewatch: data.isRewatch || false,
      rating: data.rating || null,
      notes: data.notes || null,
    });

    movie.currentSessionId = session._id;
    await movie.save();

    // Log activity
    await ActivityLogModel.create({
      userId: uId,
      entityType: 'movie',
      entityId: movie.publicId,
      action: 'created',
      summary: `Logged movie "${movie.title}" (${session.status})`,
    });

    return this.getMovieWithSessions(userId, movie.publicId);
  }

  static async createWatchlistMovie(userId: string, data: any): Promise<any> {
    const uId = new Types.ObjectId(userId);

    const check = await this.checkExists(userId, data.title);
    if (check.exists) {
      throw new AppError(`Movie '${data.title}' already exists with status: ${check.status}`, 400);
    }

    const movie = await MovieModel.create({
      userId: uId,
      title: data.title,
      director: data.director || null,
      year: data.year || null,
      genre: data.genre || null,
      posterImage: data.posterImage || null,
      platform: data.platform || null,
      durationMinutes: data.durationMinutes || null,
      isWatchlist: true,
      tags: data.tags || [],
    });

    return this.getMovieWithSessions(userId, movie.publicId);
  }

  static async updateMovieAndSession(userId: string, moviePublicId: string, data: any): Promise<any> {
    const movie = await MovieModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: moviePublicId,
    });

    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    if (data.title !== undefined) movie.title = data.title;
    if (data.director !== undefined) movie.director = data.director;
    if (data.year !== undefined) movie.year = data.year;
    if (data.genre !== undefined) movie.genre = data.genre;
    if (data.posterImage !== undefined) movie.posterImage = data.posterImage;
    if (data.platform !== undefined) movie.platform = data.platform;
    if (data.durationMinutes !== undefined) movie.durationMinutes = data.durationMinutes;
    if (data.isFavorite !== undefined) movie.isFavorite = data.isFavorite;
    if (data.isWatchlist !== undefined) movie.isWatchlist = data.isWatchlist;
    if (data.linkedTabSessions !== undefined) movie.linkedTabSessions = data.linkedTabSessions;
    if (data.referenceUrls !== undefined) movie.referenceUrls = data.referenceUrls;
    if (data.tags !== undefined) movie.tags = data.tags;

    await movie.save();

    // Update current session if session fields are provided
    if (movie.currentSessionId) {
      const session = await MediaSessionModel.findById(movie.currentSessionId);
      if (session) {
        if (data.status !== undefined) session.status = data.status;
        if (data.startDate !== undefined) session.startDate = new Date(data.startDate);
        if (data.endDate !== undefined) session.endDate = data.endDate ? new Date(data.endDate) : null;
        if (data.currentTimestamp !== undefined) session.currentPosition = data.currentTimestamp;
        if (data.stopReason !== undefined) session.stopReason = data.stopReason;
        if (data.isRewatch !== undefined) session.isRewatch = data.isRewatch;
        if (data.rating !== undefined) session.rating = data.rating;
        if (data.notes !== undefined) session.notes = data.notes;
        await session.save();
      }
    }

    return this.getMovieWithSessions(userId, movie.publicId);
  }

  static async startRewatch(userId: string, moviePublicId: string, data: any): Promise<any> {
    const movie = await MovieModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: moviePublicId,
    });

    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    const session = await MediaSessionModel.create({
      userId: new Types.ObjectId(userId),
      mediaType: 'movie',
      mediaId: movie._id,
      status: data.status || 'rewatching',
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      isRewatch: true,
      rating: data.rating || null,
      notes: data.notes || null,
    });

    movie.currentSessionId = session._id;
    await movie.save();

    return this.getMovieWithSessions(userId, movie.publicId);
  }

  static async toggleFavorite(userId: string, moviePublicId: string, isFavorite: boolean): Promise<IMovie> {
    const movie = await MovieModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), publicId: moviePublicId },
      { isFavorite },
      { new: true }
    );
    if (!movie) throw new AppError('Movie not found', 404);
    return movie;
  }

  static async toggleWatchlist(userId: string, moviePublicId: string, isWatchlist: boolean): Promise<IMovie> {
    const movie = await MovieModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), publicId: moviePublicId },
      { isWatchlist },
      { new: true }
    );
    if (!movie) throw new AppError('Movie not found', 404);
    return movie;
  }

  static async deleteMovie(userId: string, moviePublicId: string): Promise<void> {
    const movie = await MovieModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: moviePublicId,
    });

    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    await MediaSessionModel.deleteMany({ mediaType: 'movie', mediaId: movie._id });
    await MovieModel.deleteOne({ _id: movie._id });
  }
}
