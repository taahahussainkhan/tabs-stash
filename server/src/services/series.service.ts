import { SeriesModel, ISeries, ISeason, IEpisode } from '../models/series.model';
import { MediaSessionModel, IMediaSession } from '../models/media-session.model';
import { ActivityLogModel } from '../models/activity-log.model';
import { CatalogMediaModel } from '../models/catalog-media.model';
import { AppError } from '../middlewares/error.middleware';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { mediaCatalogService } from './catalog/media-catalog.service';

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

    const formattedItems = items.map(s => {
      const sObj = (s as any).toObject ? (s as any).toObject() : s;
      const currentSession = sObj.currentSessionId;
      const allEpisodes = (sObj.seasons || []).flatMap((season: any) => season.episodes || []);
      const totalEpisodes = allEpisodes.length;
      const watchedEpisodes = allEpisodes.filter((e: any) => e.isWatched).length;

      const normalizedSeries = {
        ...sObj,
        public_id: sObj.publicId,
        is_favorite: sObj.isFavorite,
        is_watchlist: sObj.isWatchlist,
        poster_image: sObj.posterImage,
        created_at: sObj.createdAt,
        updated_at: sObj.updatedAt,
        total_episodes: totalEpisodes,
        episodes_watched: watchedEpisodes,
      };

      const normalizedSession = currentSession ? {
        ...(currentSession.toObject ? currentSession.toObject() : currentSession),
        public_id: currentSession.publicId,
        status: currentSession.status,
        start_date: currentSession.startDate,
        end_date: currentSession.endDate,
        current_position: currentSession.currentPosition,
        stop_reason: currentSession.stopReason,
        is_rewatch: currentSession.isRewatch,
        created_at: currentSession.createdAt,
        updated_at: currentSession.updatedAt,
      } : null;

      return {
        ...normalizedSeries,
        series: normalizedSeries,
        current_session: normalizedSession,
      };
    });

    return {
      items: formattedItems,
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

    const to_watch = await MediaSessionModel.countDocuments({
      userId: uId,
      mediaType: 'series',
      status: 'to_watch',
    });

    return {
      total,
      watching,
      completed,
      to_watch,
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

    // Auto-enrich series with catalog seasons & metadata from canonical catalog or provider
    let catalogDoc = null;
    if (data.title || data.externalId) {
      try {
        let details: any = null;

        // 1. Direct external ID if provided
        if (data.externalId) {
          details = await mediaCatalogService.getDetails(String(data.externalId), 'series');
        }

        // 2. Fast local canonical hit by title (0 external TMDB calls)
        if (!details && data.title) {
          details = await mediaCatalogService.findCanonicalByTitle(data.title, 'series');
        }

        // 3. Fallback search
        if (!details && data.title) {
          const searchResults = await mediaCatalogService.search(data.title, 'series');
          if (searchResults && searchResults.length > 0) {
            const match = searchResults.find(r => r.title.toLowerCase() === data.title.toLowerCase()) || searchResults[0];
            details = await mediaCatalogService.getDetails(match.id, 'series');
          }
        }

        if (details) {
          if ((!data.seasons || data.seasons.length === 0 || !data.seasons[0]?.episodes?.length) && details.seasons && details.seasons.length > 0) {
            data.seasons = details.seasons;
          }
          if (!data.posterImage && details.posterUrl) {
            data.posterImage = details.posterUrl;
          }
          if (!data.creator && details.creator) {
            data.creator = details.creator;
          }
          if (!data.year && details.year) {
            data.year = details.year;
          }
          if (!data.genre && details.genres?.length) {
            data.genre = details.genres.join(', ');
          }
          if (!data.externalId && details.id) {
            data.externalId = details.id;
          }

          catalogDoc = await CatalogMediaModel.findOne({ externalId: details.id, type: 'series' });
        }
      } catch (err) {
        console.warn('[SeriesService] Auto-enrich series from catalog failed:', err);
      }
    }

    if (!catalogDoc && data.externalId) {
      catalogDoc = await CatalogMediaModel.findOne({ externalId: String(data.externalId), type: 'series' });
    }
    if (!catalogDoc && data.title) {
      catalogDoc = await CatalogMediaModel.findOne({ titleLower: data.title.trim().toLowerCase(), type: 'series' });
    }

    // Build seasons and auto-generate episodes
    const seasons: ISeason[] = [];
    if (data.seasons && Array.isArray(data.seasons)) {
      for (const s of data.seasons) {
        const episodes: IEpisode[] = [];
        const epCount = s.episodeCount || s.episodes?.length || 0;
        for (let i = 1; i <= epCount; i++) {
          const catEp = s.episodes?.find((e: any) => (e.episodeNumber || e.episode_number) === i) || s.episodes?.[i - 1];
          episodes.push({
            publicId: randomUUID(),
            episodeNumber: i,
            title: catEp?.title || `Episode ${i}`,
            duration: catEp?.duration || null,
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
      catalogId: catalogDoc?._id || undefined,
      externalId: data.externalId || catalogDoc?.externalId || undefined,
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
      status: data.status || 'to_watch',
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
  static async syncCatalog(userId: string, seriesPublicId: string) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: seriesPublicId,
    });
    if (!series) throw new AppError('Series not found', 404);

    let details: any = null;

    // 1. Direct external ID if already linked
    if (series.externalId) {
      details = await mediaCatalogService.getDetails(series.externalId, 'series');
    }

    // 2. Fast local canonical hit by title
    if (!details && series.title) {
      details = await mediaCatalogService.findCanonicalByTitle(series.title, 'series');
    }

    // 3. Fallback search
    if (!details) {
      const searchResults = await mediaCatalogService.search(series.title, 'series');
      if (!searchResults || searchResults.length === 0) {
        throw new AppError(`No catalog matches found for series '${series.title}'`, 404);
      }

      const match = searchResults.find(r => r.title.toLowerCase() === series.title.toLowerCase()) || searchResults[0];
      details = await mediaCatalogService.getDetails(match.id, 'series');
    }

    if (!details) {
      throw new AppError(`Failed to fetch catalog details for '${series.title}'`, 404);
    }

    const catalogDoc = await CatalogMediaModel.findOne({ externalId: details.id, type: 'series' });
    if (catalogDoc && !series.catalogId) {
      series.catalogId = catalogDoc._id;
    }
    if (details.id && !series.externalId) {
      series.externalId = details.id;
    }

    let addedSeasonsCount = 0;
    let addedEpisodesCount = 0;

    if (details.seasons && Array.isArray(details.seasons)) {
      for (const s of details.seasons) {
        const existingSeason = series.seasons.find(ex => ex.seasonNumber === s.seasonNumber);
        if (!existingSeason) {
          const episodes: IEpisode[] = [];
          const epCount = s.episodeCount || s.episodes?.length || 0;
          for (let i = 1; i <= epCount; i++) {
            const catEp = s.episodes?.find((e: any) => (e.episodeNumber || e.episode_number) === i) || s.episodes?.[i - 1];
            episodes.push({
              publicId: randomUUID(),
              episodeNumber: i,
              title: catEp?.title || `Episode ${i}`,
              duration: catEp?.duration || details.runtimeMinutes || null,
              isWatched: false,
              currentTimestamp: 0,
              rating: null,
              notes: null,
            });
            addedEpisodesCount++;
          }

          series.seasons.push({
            publicId: randomUUID(),
            seasonNumber: s.seasonNumber,
            title: s.title || `Season ${s.seasonNumber}`,
            year: s.year || null,
            episodeCount: epCount,
            notes: null,
            episodes,
          });
          addedSeasonsCount++;
        } else {
          // Backfill missing titles & durations on existing seasons
          if (s.title && (!existingSeason.title || existingSeason.title === `Season ${existingSeason.seasonNumber}`)) {
            existingSeason.title = s.title;
          }
          if (s.year && !existingSeason.year) {
            existingSeason.year = s.year;
          }
          if (s.episodes && Array.isArray(s.episodes)) {
            for (const catEp of s.episodes) {
              const existingEp = existingSeason.episodes.find(e => e.episodeNumber === catEp.episodeNumber);
              if (existingEp) {
                if (catEp.title && (!existingEp.title || existingEp.title === `Episode ${existingEp.episodeNumber}`)) {
                  existingEp.title = catEp.title;
                }
                if (catEp.duration && (!existingEp.duration || existingEp.duration === 0)) {
                  existingEp.duration = catEp.duration;
                }
              } else {
                existingSeason.episodes.push({
                  publicId: randomUUID(),
                  episodeNumber: catEp.episodeNumber,
                  title: catEp.title || `Episode ${catEp.episodeNumber}`,
                  duration: catEp.duration || details.runtimeMinutes || null,
                  isWatched: false,
                  currentTimestamp: 0,
                  rating: null,
                  notes: null,
                });
                addedEpisodesCount++;
              }
            }
            existingSeason.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
            existingSeason.episodeCount = existingSeason.episodes.length;
          }
        }
      }
    }

    if (!series.posterImage && details.posterUrl) {
      series.posterImage = details.posterUrl;
    }
    if (!series.creator && details.creator) {
      series.creator = details.creator;
    }
    if (!series.year && details.year) {
      series.year = details.year;
    }
    if (!series.genre && details.genres?.length) {
      series.genre = details.genres.join(', ');
    }

    series.seasons.sort((a, b) => a.seasonNumber - b.seasonNumber);
    series.markModified('seasons');
    await series.save();

    return {
      message: `Synchronized ${addedSeasonsCount} seasons and ${addedEpisodesCount} episodes from catalog.`,
      addedSeasonsCount,
      addedEpisodesCount,
      series: await this.getSeriesWithSessions(userId, series.publicId),
    };
  }

  static async getSeasons(userId: string, seriesPublicId: string) {
    let series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      publicId: seriesPublicId,
    });
    if (!series) throw new AppError('Series not found', 404);

    // Auto-fill seasons or missing episode titles/durations from catalog
    const hasMissingSeasons = series.seasons.length === 0;
    const hasUnenrichedEpisodes = series.seasons.some(s => 
      s.episodes.length > 0 && s.episodes.some(e => (!e.duration || e.duration === 0) || e.title === `Episode ${e.episodeNumber}`)
    );

    if ((hasMissingSeasons || hasUnenrichedEpisodes) && series.title) {
      try {
        await this.syncCatalog(userId, seriesPublicId);
        series = await SeriesModel.findOne({
          userId: new Types.ObjectId(userId),
          publicId: seriesPublicId,
        });
        if (!series) throw new AppError('Series not found', 404);
      } catch (err) {
        console.warn('[SeriesService] Auto-populate seasons during getSeasons failed:', err);
      }
    }

    if (!series) throw new AppError('Series not found', 404);

    return series.seasons.map(s => {
      const watchedCount = s.episodes.filter(e => e.isWatched).length;
      const totalEpisodes = s.episodes.length;
      const inProgressCount = s.episodes.filter(e => !e.isWatched && (e.currentTimestamp || 0) > 0).length;
      let status: 'to_watch' | 'watching' | 'completed' = 'to_watch';
      if (totalEpisodes > 0 && watchedCount === totalEpisodes) {
        status = 'completed';
      } else if (watchedCount > 0 || inProgressCount > 0) {
        status = 'watching';
      }

      const ratedEpisodes = s.episodes.filter(e => e.rating != null);
      const avgRating = ratedEpisodes.length > 0
        ? ratedEpisodes.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedEpisodes.length
        : null;

      const seasonObj = {
        public_id: s.publicId,
        series_id: series._id,
        season_number: s.seasonNumber,
        title: s.title || `Season ${s.seasonNumber}`,
        year: s.year || null,
        episode_count: s.episodes.length,
        status,
        notes: s.notes || null,
        created_at: (series as any).createdAt?.toISOString?.() || new Date().toISOString(),
        updated_at: (series as any).updatedAt?.toISOString?.() || new Date().toISOString(),
      };

      return {
        ...s,
        public_id: s.publicId,
        season_number: s.seasonNumber,
        episode_count: s.episodes.length,
        total_episodes: s.episodes.length,
        watched_episodes: watchedCount,
        status,
        progress_percentage: s.episodes.length ? Math.round((watchedCount / s.episodes.length) * 100) : 0,
        average_rating: avgRating,
        season: seasonObj,
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
    return (season?.episodes || []).map(ep => {
      const epObj = (ep as any).toObject ? (ep as any).toObject() : ep;
      return {
        ...epObj,
        public_id: ep.publicId,
        episode_number: ep.episodeNumber,
        title: ep.title,
        duration: ep.duration,
        is_watched: ep.isWatched,
        status: ep.isWatched ? 'completed' : ((ep.currentTimestamp || 0) > 0 ? 'watching' : 'to_watch'),
        watched_date: ep.watchedDate,
        current_timestamp: ep.currentTimestamp,
        rating: ep.rating,
        notes: ep.notes,
      };
    });
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
    series.markModified('seasons');
    await series.save();

    return {
      ...newEpisode,
      public_id: newEpisode.publicId,
      episode_number: newEpisode.episodeNumber,
      title: newEpisode.title,
      duration: newEpisode.duration,
      is_watched: newEpisode.isWatched,
      status: newEpisode.isWatched ? 'completed' : ((newEpisode.currentTimestamp || 0) > 0 ? 'watching' : 'to_watch'),
      watched_date: newEpisode.watchedDate,
      current_timestamp: newEpisode.currentTimestamp,
      rating: newEpisode.rating,
      notes: newEpisode.notes,
    };
  }

  static async markSeasonWatched(userId: string, seasonPublicId: string, isWatched: boolean) {
    const series = await SeriesModel.findOne({
      userId: new Types.ObjectId(userId),
      'seasons.publicId': seasonPublicId,
    });
    if (!series) throw new AppError('Season not found', 404);

    const season = series.seasons.find(s => s.publicId === seasonPublicId);
    if (!season) throw new AppError('Season not found', 404);

    const watchedDate = isWatched ? new Date() : null;
    for (const ep of season.episodes) {
      ep.isWatched = isWatched;
      ep.watchedDate = watchedDate;
      if (!isWatched) {
        ep.currentTimestamp = 0;
      }
    }

    series.markModified('seasons');
    await series.save();

    // Synchronize media session status if present
    if (series.currentSessionId) {
      const allEpisodes = series.seasons.flatMap(s => s.episodes);
      const watchedCount = allEpisodes.filter(e => e.isWatched).length;
      const totalCount = allEpisodes.length;

      let newSessionStatus: 'to_watch' | 'watching' | 'completed';
      if (totalCount > 0 && watchedCount === totalCount) {
        newSessionStatus = 'completed';
      } else if (watchedCount > 0) {
        newSessionStatus = 'watching';
      } else {
        newSessionStatus = 'to_watch';
      }

      await MediaSessionModel.findByIdAndUpdate(series.currentSessionId, {
        status: newSessionStatus,
        progress: totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0,
        completedAt: newSessionStatus === 'completed' ? new Date() : null,
      });
    }

    return {
      message: `Season ${isWatched ? 'marked as watched' : 'marked as unwatched'}`,
      is_watched: isWatched,
      count: season.episodes.length,
    };
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
        if (!isWatched) {
          ep.currentTimestamp = 0;
        }
        targetEp = ep;
        break;
      }
    }

    series.markModified('seasons');
    await series.save();

    // Synchronize media session status if present
    if (series.currentSessionId) {
      const allEpisodes = series.seasons.flatMap(s => s.episodes);
      const watchedCount = allEpisodes.filter(e => e.isWatched).length;
      const totalCount = allEpisodes.length;

      let newSessionStatus: 'to_watch' | 'watching' | 'completed';
      if (totalCount > 0 && watchedCount === totalCount) {
        newSessionStatus = 'completed';
      } else if (watchedCount > 0) {
        newSessionStatus = 'watching';
      } else {
        newSessionStatus = 'to_watch';
      }

      await MediaSessionModel.findByIdAndUpdate(series.currentSessionId, {
        status: newSessionStatus,
        progress: totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0,
        completedAt: newSessionStatus === 'completed' ? new Date() : null,
      });
    }

    return { message: 'Episode watch status updated', is_watched: isWatched };
  }

  static async updateEpisode(userId: string, seriesPublicId: string | undefined, episodePublicId: string, data: any) {
    let series: any = null;
    if (seriesPublicId) {
      series = await SeriesModel.findOne({
        userId: new Types.ObjectId(userId),
        publicId: seriesPublicId,
      });
    }

    if (!series) {
      series = await SeriesModel.findOne({
        userId: new Types.ObjectId(userId),
        'seasons.episodes.publicId': episodePublicId,
      });
    }

    if (!series) {
      throw new AppError('Episode not found', 404);
    }

    let foundEpisode: IEpisode | null = null;
    for (const season of series.seasons) {
      const ep = season.episodes.find((e: any) => e.publicId === episodePublicId);
      if (ep) {
        if (data.title !== undefined) ep.title = data.title;
        if (data.duration !== undefined) ep.duration = data.duration;
        if (data.isWatched !== undefined || data.is_watched !== undefined || data.status !== undefined) {
          const isWatched = data.isWatched ?? data.is_watched ?? (data.status === 'completed');
          ep.isWatched = Boolean(isWatched);
          if (ep.isWatched) {
            ep.watchedDate = data.watchedDate || data.watched_date || data.end_date
              ? new Date(data.watchedDate || data.watched_date || data.end_date)
              : new Date();
          } else {
            ep.watchedDate = null;
          }
        }
        if (data.currentTimestamp !== undefined || data.current_timestamp !== undefined || data.current_position !== undefined) {
          ep.currentTimestamp = data.currentTimestamp ?? data.current_timestamp ?? data.current_position ?? 0;
        }
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

    return {
      ...foundEpisode,
      public_id: foundEpisode.publicId,
      episode_number: foundEpisode.episodeNumber,
      title: foundEpisode.title,
      duration: foundEpisode.duration,
      is_watched: foundEpisode.isWatched,
      watched_date: foundEpisode.watchedDate,
      current_timestamp: foundEpisode.currentTimestamp,
    };
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
