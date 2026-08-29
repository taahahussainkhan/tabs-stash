import { SeriesModel, ISeries, ISeason, IEpisode } from '../models/series.model';
import { MediaSessionModel, IMediaSession } from '../models/media-session.model';
import { ActivityLogModel } from '../models/activity-log.model';
import { AppError } from '../middlewares/error.middleware';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';

export class SeriesService {
  static async getPaginatedSeries(userId: string, options: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    status?: string;
    creator?: string;
    genre?: string;
    platform?: string;
    yearMin?: number;
    yearMax?: number;
    ratingMin?: number;
    ratingMax?: number;
    isFavorite?: boolean;
    isWatchlist?: boolean;
  }) {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 10));
    const skip = (page - 1) * pageSize;

    const filter: any = { userId: new Types.ObjectId(userId) };

    if (options.isFavorite !== undefined) filter.isFavorite = options.isFavorite;
    if (options.isWatchlist !== undefined) filter.isWatchlist = options.isWatchlist;
    if (options.creator) filter.creator = new RegExp(options.creator, 'i');
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
        { creator: searchRegex },
        { genre: searchRegex },
      ];
    }

    const sortField = options.sortBy || 'updatedAt';
    const sortDir = options.sortOrder === 'asc' ? 1 : -1;
    const sortObj: any = { [sortField]: sortDir };

    const total = await SeriesModel.countDocuments(filter);
    const items = await SeriesModel.find(filter)
      .populate('currentSessionId')
      .populate('tags')
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items,
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
    const total = await SeriesModel.countDocuments({ userId: uId });
    const favorites = await SeriesModel.countDocuments({ userId: uId, isFavorite: true });
    const watchlist = await SeriesModel.countDocuments({ userId: uId, isWatchlist: true });

    const watching = await MediaSessionModel.countDocuments({
      userId: uId,
      mediaType: 'series',
      status: 'watching',
    });

    const completed = await MediaSessionModel.countDocuments({
      userId: uId,
      mediaType: 'series',
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

  static async checkExists(userId: string, title: string) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      title: new RegExp(`^${title.trim()}$`, 'i'),
    }).populate('currentSessionId');

    if (!series) {
      return { exists: false };
    }

    const session = series.currentSessionId as unknown as IMediaSession;
    return {
      exists: true,
      status: session ? session.status : (series.isWatchlist ? 'watchlist' : 'logged'),
      series,
    };
  }

  static async getSeriesWithSessions(userId: string, seriesPublicId: string) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: seriesPublicId,
    }).populate('tags').populate('linkedTabSessions');

    if (!series) {
      throw new AppError('Series not found', 404);
    }

    const sessions = await MediaSessionModel.find({
      userId: new Types.ObjectId(userId),
      mediaType: 'series',
      mediaId: series._id,
    }).sort({ startDate: -1 });

    const currentSession = series.currentSessionId
      ? await MediaSessionModel.findById(series.currentSessionId)
      : (sessions.length > 0 ? sessions[0] : null);

    return {
      series,
      sessions,
      current_session: currentSession,
    };
  }

  static async createSeries(userId: string, data: any) {
    const uId = new Types.ObjectId(userId);

    const check = await this.checkExists(userId, data.title);
    if (check.exists) {
      throw new AppError(`Series '${data.title}' already exists with status: ${check.status}`, 400);
    }

    // Build seasons and auto-generate episodes
    const seasons: ISeason[] = [];
    if (data.seasons && Array.isArray(data.seasons)) {
      for (const s of data.seasons) {
        const episodes: IEpisode[] = [];
        const epCount = s.episodeCount || 0;
        for (let i = 1; i <= epCount; i++) {
          episodes.push({
            publicId: randomUUID(),
            episodeNumber: i,
            title: `Episode ${i}`,
            isWatched: false,
            currentTimestamp: 0,
            rating: null,
            notes: null,
          });
        }

        seasons.push({
          publicId: randomUUID(),
          seasonNumber: s.seasonNumber,
          title: s.title || `Season ${s.seasonNumber}`,
          year: s.year || null,
          episodeCount: epCount,
          notes: s.notes || null,
          episodes,
        });
      }
    }

    const series = new SeriesModel({
      userId: uId,
      title: data.title,
      creator: data.creator || null,
      year: data.year || null,
      genre: data.genre || null,
      posterImage: data.posterImage || null,
      platform: data.platform || null,
      isFavorite: data.isFavorite || false,
      isWatchlist: data.isWatchlist || false,
      seasons,
      linkedTabSessions: data.linkedTabSessions || [],
      referenceUrls: data.referenceUrls || [],
      tags: data.tags || [],
    });

    await series.save();

    const session = await MediaSessionModel.create({
      userId: uId,
      mediaType: 'series',
      mediaId: series._id,
      status: data.status || 'watching',
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
      currentPosition: data.currentTimestamp || 0,
      stopReason: data.stopReason || null,
      isRewatch: data.isRewatch || false,
      rating: data.rating || null,
      notes: data.notes || null,
    });

    series.currentSessionId = session._id;
    await series.save();

    await ActivityLogModel.create({
      userId: uId,
      entityType: 'series',
      entityId: series.publicId,
      action: 'created',
      summary: `Logged series "${series.title}" (${session.status})`,
    });

    return this.getSeriesWithSessions(userId, series.publicId);
  }

  static async updateSeries(userId: string, seriesPublicId: string, data: any) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: seriesPublicId,
    });

    if (!series) {
      throw new AppError('Series not found', 404);
    }

    if (data.title !== undefined) series.title = data.title;
    if (data.creator !== undefined) series.creator = data.creator;
    if (data.year !== undefined) series.year = data.year;
    if (data.genre !== undefined) series.genre = data.genre;
    if (data.posterImage !== undefined) series.posterImage = data.posterImage;
    if (data.platform !== undefined) series.platform = data.platform;
    if (data.isFavorite !== undefined) series.isFavorite = data.isFavorite;
    if (data.isWatchlist !== undefined) series.isWatchlist = data.isWatchlist;
    if (data.linkedTabSessions !== undefined) series.linkedTabSessions = data.linkedTabSessions;
    if (data.referenceUrls !== undefined) series.referenceUrls = data.referenceUrls;
    if (data.tags !== undefined) series.tags = data.tags;

    await series.save();

    if (series.currentSessionId) {
      const session = await MediaSessionModel.findById(series.currentSessionId);
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

    return this.getSeriesWithSessions(userId, series.publicId);
  }

  // --- Granular Seasons & Episodes APIs ---
  static async getSeasons(userId: string, seriesPublicId: string) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: seriesPublicId,
    });
    if (!series) throw new AppError('Series not found', 404);

    return series.seasons.map(s => {
      const watchedCount = s.episodes.filter(e => e.isWatched).length;
      return {
        ...s,
        public_id: s.publicId,
        season_number: s.seasonNumber,
        episode_count: s.episodes.length,
        watched_episodes: watchedCount,
        progress_percentage: s.episodes.length ? Math.round((watchedCount / s.episodes.length) * 100) : 0,
      };
    });
  }

  static async createSeason(userId: string, seriesPublicId: string, data: any) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: seriesPublicId,
    });
    if (!series) throw new AppError('Series not found', 404);

    const epCount = data.episode_count || data.episodeCount || 0;
    const episodes: IEpisode[] = [];
    for (let i = 1; i <= epCount; i++) {
      episodes.push({
        publicId: randomUUID(),
        episodeNumber: i,
        title: `Episode ${i}`,
        isWatched: false,
        currentTimestamp: 0,
        rating: null,
        notes: null,
      });
    }

    const newSeason: ISeason = {
      publicId: randomUUID(),
      seasonNumber: data.season_number || data.seasonNumber || series.seasons.length + 1,
      title: data.title || `Season ${data.season_number || data.seasonNumber}`,
      year: data.year || null,
      episodeCount: epCount,
      notes: data.notes || null,
      episodes,
    };

    series.seasons.push(newSeason);
    series.markModified('seasons');
    await series.save();

    return newSeason;
  }

  static async getEpisodes(userId: string, seasonPublicId: string) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      'seasons.publicId': seasonPublicId,
    });
    if (!series) throw new AppError('Season not found', 404);

    const season = series.seasons.find(s => s.publicId === seasonPublicId);
    return (season?.episodes || []).map(ep => ({
      ...ep,
      public_id: ep.publicId,
      episode_number: ep.episodeNumber,
      is_watched: ep.isWatched,
      watched_date: ep.watchedDate,
      current_timestamp: ep.currentTimestamp,
    }));
  }

  static async createEpisode(userId: string, seasonPublicId: string, data: any) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      'seasons.publicId': seasonPublicId,
    });
    if (!series) throw new AppError('Season not found', 404);

    const season = series.seasons.find(s => s.publicId === seasonPublicId);
    if (!season) throw new AppError('Season not found', 404);

    const newEpisode: IEpisode = {
      publicId: randomUUID(),
      episodeNumber: data.episode_number || data.episodeNumber || season.episodes.length + 1,
      title: data.title || `Episode ${season.episodes.length + 1}`,
      duration: data.duration || null,
      isWatched: data.is_watched || data.isWatched || false,
      watchedDate: data.watched_date ? new Date(data.watched_date) : null,
      currentTimestamp: data.current_timestamp || 0,
      rating: data.rating || null,
      notes: data.notes || null,
    };

    season.episodes.push(newEpisode);
    season.episodeCount = season.episodes.length;
    series.markModified('seasons');
    await series.save();

    return newEpisode;
  }

  static async markEpisodeWatched(userId: string, episodePublicId: string, isWatched: boolean) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      'seasons.episodes.publicId': episodePublicId,
    });
    if (!series) throw new AppError('Episode not found', 404);

    let targetEp: IEpisode | null = null;
    for (const season of series.seasons) {
      const ep = season.episodes.find(e => e.publicId === episodePublicId);
      if (ep) {
        ep.isWatched = isWatched;
        ep.watchedDate = isWatched ? new Date() : null;
        targetEp = ep;
        break;
      }
    }

    series.markModified('seasons');
    await series.save();

    return { message: 'Episode watch status updated', is_watched: isWatched };
  }

  static async updateEpisode(userId: string, seriesPublicId: string, episodePublicId: string, data: any) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: seriesPublicId,
    });

    if (!series) {
      throw new AppError('Series not found', 404);
    }

    let foundEpisode: IEpisode | null = null;
    for (const season of series.seasons) {
      const ep = season.episodes.find(e => e.publicId === episodePublicId);
      if (ep) {
        if (data.title !== undefined) ep.title = data.title;
        if (data.duration !== undefined) ep.duration = data.duration;
        if (data.isWatched !== undefined) {
          ep.isWatched = data.isWatched;
          ep.watchedDate = data.isWatched ? (data.watchedDate ? new Date(data.watchedDate) : new Date()) : null;
        }
        if (data.currentTimestamp !== undefined) ep.currentTimestamp = data.currentTimestamp;
        if (data.rating !== undefined) ep.rating = data.rating;
        if (data.notes !== undefined) ep.notes = data.notes;
        foundEpisode = ep;
        break;
      }
    }

    if (!foundEpisode) {
      throw new AppError('Episode not found', 404);
    }

    series.markModified('seasons');
    await series.save();

    return foundEpisode;
  }

  static async getNextUnwatched(userId: string, seriesPublicId: string) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: seriesPublicId,
    });
    if (!series) throw new AppError('Series not found', 404);

    for (const s of series.seasons) {
      for (const ep of s.episodes) {
        if (!ep.isWatched) {
          return { season: s, episode: ep };
        }
      }
    }
    return { season: null, episode: null, message: 'All episodes watched' };
  }

  static async startRewatch(userId: string, seriesPublicId: string, data: any) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: seriesPublicId,
    });

    if (!series) {
      throw new AppError('Series not found', 404);
    }

    const session = await MediaSessionModel.create({
      userId: new Types.ObjectId(userId),
      mediaType: 'series',
      mediaId: series._id,
      status: data.status || 'rewatching',
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      isRewatch: true,
      rating: data.rating || null,
      notes: data.notes || null,
    });

    series.currentSessionId = session._id;
    await series.save();

    return this.getSeriesWithSessions(userId, series.publicId);
  }

  static async toggleFavorite(userId: string, seriesPublicId: string, isFavorite: boolean) {
    const series = await SeriesModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), publicId: seriesPublicId },
      { isFavorite },
      { new: true }
    );
    if (!series) throw new AppError('Series not found', 404);
    return series;
  }

  static async toggleWatchlist(userId: string, seriesPublicId: string, isWatchlist: boolean) {
    const series = await SeriesModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), publicId: seriesPublicId },
      { isWatchlist },
      { new: true }
    );
    if (!series) throw new AppError('Series not found', 404);
    return series;
  }

  static async deleteSeries(userId: string, seriesPublicId: string): Promise<void> {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: seriesPublicId,
    });

    if (!series) {
      throw new AppError('Series not found', 404);
    }

    await MediaSessionModel.deleteMany({ mediaType: 'series', mediaId: series._id });
    await SeriesModel.deleteOne({ _id: series._id });
  }
}
