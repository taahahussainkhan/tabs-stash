import { MovieModel } from '../models/movie.model';
import { SeriesModel } from '../models/series.model';
import { BookWorkModel, BookItemModel } from '../models/book.model';
import { StashedSessionModel } from '../models/session.model';
import { MediaSessionModel } from '../models/media-session.model';
import { Types } from 'mongoose';
import { CacheService } from './cache.service';

export class DashboardService {
  static async getDashboardStats(userId: string) {
    const uId = new Types.ObjectId(userId);
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Run media aggregation and counts in parallel
    const [
      mediaAgg,
      totalMovies,
      totalSeries,
      totalBooks,
      totalStashedTabs,
      watchlistMovies,
      watchlistSeries,
      wishlistBooks,
    ] = await Promise.all([
      MediaSessionModel.aggregate([
        { $match: { userId: uId } },
        {
          $facet: {
            watching: [
              { $match: { mediaType: { $in: ['movie', 'series'] }, status: 'watching' } },
              { $count: 'count' },
            ],
            reading: [
              { $match: { mediaType: 'book', status: 'reading' } },
              { $count: 'count' },
            ],
            completed: [
              { $match: { status: 'completed' } },
              { $count: 'count' },
            ],
            completedThisMonth: [
              { $match: { status: 'completed', endDate: { $gte: firstDayOfMonth } } },
              { $count: 'count' },
            ],
          },
        },
      ]),
      MovieModel.countDocuments({ userId: uId }),
      SeriesModel.countDocuments({ userId: uId }),
      BookItemModel.countDocuments({ userId: uId }),
      StashedSessionModel.countDocuments({ userId: uId, deletedAt: null }),
      MovieModel.countDocuments({ userId: uId, isWatchlist: true }),
      SeriesModel.countDocuments({ userId: uId, isWatchlist: true }),
      BookItemModel.countDocuments({ userId: uId, ownershipStatus: 'Wishlist' }),
    ]);

    const mediaFacet = mediaAgg[0] || {};
    const watching = mediaFacet.watching?.[0]?.count || 0;
    const reading = mediaFacet.reading?.[0]?.count || 0;
    const completed = mediaFacet.completed?.[0]?.count || 0;
    const completedThisMonth = mediaFacet.completedThisMonth?.[0]?.count || 0;

    return {
      total_movies: totalMovies,
      total_series: totalSeries,
      total_books: totalBooks,
      total_stashed_tabs: totalStashedTabs,
      watching: watching + reading,
      reading,
      completed,
      watchlist: watchlistMovies + watchlistSeries + wishlistBooks,
      completed_this_month: completedThisMonth,
    };
  }

  static async getDashboardData(userId: string) {
    // 1. Check in-memory cache first (< 0.1ms)
    const cached = CacheService.getDashboard(userId);
    if (cached) {
      return cached;
    }

    const uId = new Types.ObjectId(userId);
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // 2. Fetch stats AND media session feeds concurrently in one unified roundtrip
    const [
      mediaAgg,
      totalMovies,
      totalSeries,
      totalBooks,
      totalStashedTabs,
      watchlistMovies,
      watchlistSeries,
      wishlistBooks,
      activeSessions,
      completedSessions,
      wlMovies,
      wlSeries,
    ] = await Promise.all([
      MediaSessionModel.aggregate([
        { $match: { userId: uId } },
        {
          $facet: {
            watching: [
              { $match: { mediaType: { $in: ['movie', 'series'] }, status: 'watching' } },
              { $count: 'count' },
            ],
            reading: [
              { $match: { mediaType: 'book', status: 'reading' } },
              { $count: 'count' },
            ],
            completed: [
              { $match: { status: 'completed' } },
              { $count: 'count' },
            ],
            completedThisMonth: [
              { $match: { status: 'completed', endDate: { $gte: firstDayOfMonth } } },
              { $count: 'count' },
            ],
          },
        },
      ]),
      MovieModel.countDocuments({ userId: uId }),
      SeriesModel.countDocuments({ userId: uId }),
      BookItemModel.countDocuments({ userId: uId }),
      StashedSessionModel.countDocuments({ userId: uId, deletedAt: null }),
      MovieModel.countDocuments({ userId: uId, isWatchlist: true }),
      SeriesModel.countDocuments({ userId: uId, isWatchlist: true }),
      BookItemModel.countDocuments({ userId: uId, ownershipStatus: 'Wishlist' }),
      MediaSessionModel.find({
        userId: uId,
        status: { $in: ['watching', 'reading'] },
      })
        .sort({ updatedAt: -1 })
        .limit(15)
        .lean(),
      MediaSessionModel.find({
        userId: uId,
        status: 'completed',
      })
        .sort({ endDate: -1, updatedAt: -1 })
        .limit(9)
        .lean(),
      MovieModel.find({ userId: uId, isWatchlist: true }).sort({ updatedAt: -1 }).limit(5).lean(),
      SeriesModel.find({ userId: uId, isWatchlist: true }).sort({ updatedAt: -1 }).limit(5).lean(),
    ]);

    const mediaFacet = mediaAgg[0] || {};
    const watching = mediaFacet.watching?.[0]?.count || 0;
    const reading = mediaFacet.reading?.[0]?.count || 0;
    const completed = mediaFacet.completed?.[0]?.count || 0;
    const completedThisMonth = mediaFacet.completedThisMonth?.[0]?.count || 0;

    const stats = {
      total_movies: totalMovies,
      total_series: totalSeries,
      total_books: totalBooks,
      total_stashed_tabs: totalStashedTabs,
      watching: watching + reading,
      reading,
      completed,
      watchlist: watchlistMovies + watchlistSeries + wishlistBooks,
      completed_this_month: completedThisMonth,
    };

    // 2. Collect all referenced media IDs to batch fetch
    const allMovieIds = new Set<string>();
    const allSeriesIds = new Set<string>();
    const allBookItemIds = new Set<string>();

    [...activeSessions, ...completedSessions].forEach((s) => {
      if (s.mediaId) {
        const idStr = s.mediaId.toString();
        if (s.mediaType === 'movie') allMovieIds.add(idStr);
        else if (s.mediaType === 'series') allSeriesIds.add(idStr);
        else if (s.mediaType === 'book') allBookItemIds.add(idStr);
      }
    });

    const [moviesBatch, seriesBatch, bookItemsBatch] = await Promise.all([
      allMovieIds.size > 0 ? MovieModel.find({ _id: { $in: Array.from(allMovieIds) } }).lean() : [],
      allSeriesIds.size > 0 ? SeriesModel.find({ _id: { $in: Array.from(allSeriesIds) } }).lean() : [],
      allBookItemIds.size > 0
        ? BookItemModel.find({ _id: { $in: Array.from(allBookItemIds) } }).populate({
            path: 'editionId',
            populate: { path: 'bookId', populate: { path: 'authors' } },
          })
        : [],
    ]);

    const movieMap = new Map<string, any>(moviesBatch.map((m: any) => [m._id.toString(), m]));
    const seriesMap = new Map<string, any>(seriesBatch.map((s: any) => [s._id.toString(), s]));
    const bookMap = new Map<string, any>(bookItemsBatch.map((b: any) => [b._id.toString(), b]));

    // 3. Assemble Continue Watching
    const continueWatching: any[] = [];
    for (const session of activeSessions) {
      const mediaIdStr = session.mediaId?.toString();
      if (session.mediaType === 'movie') {
        const movie = movieMap.get(mediaIdStr);
        if (movie) {
          continueWatching.push({
            public_id: movie.publicId,
            title: movie.title,
            type: 'movie',
            author_or_director: movie.director,
            year: movie.year,
            genre: movie.genre,
            status: session.status,
            rating: session.rating,
            is_favorite: movie.isFavorite,
            is_watchlist: movie.isWatchlist,
            updated_at: movie.updatedAt?.toISOString ? movie.updatedAt.toISOString() : new Date(movie.updatedAt).toISOString(),
            end_date: session.endDate ? new Date(session.endDate).toISOString() : null,
          });
        }
      } else if (session.mediaType === 'series') {
        const series = seriesMap.get(mediaIdStr);
        if (series) {
          continueWatching.push({
            public_id: series.publicId,
            title: series.title,
            type: 'series',
            author_or_director: series.creator,
            year: series.year,
            genre: series.genre,
            status: session.status,
            rating: session.rating,
            is_favorite: series.isFavorite,
            is_watchlist: series.isWatchlist,
            updated_at: series.updatedAt?.toISOString ? series.updatedAt.toISOString() : new Date(series.updatedAt).toISOString(),
            end_date: session.endDate ? new Date(session.endDate).toISOString() : null,
          });
        }
      } else if (session.mediaType === 'book') {
        const bookItem = bookMap.get(mediaIdStr);
        if (bookItem && (bookItem.editionId as any)?.bookId) {
          const work = (bookItem.editionId as any).bookId;
          const authors = work.authors?.map((a: any) => a.name).join(', ') || '';
          continueWatching.push({
            public_id: bookItem.publicId,
            title: work.title,
            type: 'book',
            author_or_director: authors,
            year: work.originalYear,
            genre: null,
            status: session.status,
            rating: session.rating,
            is_favorite: false,
            is_watchlist: bookItem.ownershipStatus === 'Wishlist',
            updated_at: bookItem.updatedAt?.toISOString ? bookItem.updatedAt.toISOString() : new Date(bookItem.updatedAt).toISOString(),
            end_date: session.endDate ? new Date(session.endDate).toISOString() : null,
          });
        }
      }
    }

    // 4. Assemble Recently Completed
    const recentlyCompleted: any[] = [];
    for (const session of completedSessions) {
      const mediaIdStr = session.mediaId?.toString();
      if (session.mediaType === 'movie') {
        const movie = movieMap.get(mediaIdStr);
        if (movie) {
          recentlyCompleted.push({
            public_id: movie.publicId,
            title: movie.title,
            type: 'movie',
            author_or_director: movie.director,
            year: movie.year,
            genre: movie.genre,
            status: 'completed',
            rating: session.rating,
            is_favorite: movie.isFavorite,
            is_watchlist: movie.isWatchlist,
            updated_at: movie.updatedAt?.toISOString ? movie.updatedAt.toISOString() : new Date(movie.updatedAt).toISOString(),
            end_date: session.endDate ? new Date(session.endDate).toISOString() : null,
          });
        }
      } else if (session.mediaType === 'series') {
        const series = seriesMap.get(mediaIdStr);
        if (series) {
          recentlyCompleted.push({
            public_id: series.publicId,
            title: series.title,
            type: 'series',
            author_or_director: series.creator,
            year: series.year,
            genre: series.genre,
            status: 'completed',
            rating: session.rating,
            is_favorite: series.isFavorite,
            is_watchlist: series.isWatchlist,
            updated_at: series.updatedAt?.toISOString ? series.updatedAt.toISOString() : new Date(series.updatedAt).toISOString(),
            end_date: session.endDate ? new Date(session.endDate).toISOString() : null,
          });
        }
      }
    }

    // 3. Watchlist & Wishlist Preview (Top 9)
    const watchlistPreview: any[] = [];
    for (const m of wlMovies) {
      watchlistPreview.push({
        public_id: m.publicId,
        title: m.title,
        type: 'movie',
        author_or_director: m.director,
        year: m.year,
        genre: m.genre,
        status: 'watchlist',
        rating: null,
        is_favorite: m.isFavorite,
        is_watchlist: true,
        updated_at: m.updatedAt.toISOString(),
        end_date: null,
      });
    }
    for (const s of wlSeries) {
      watchlistPreview.push({
        public_id: s.publicId,
        title: s.title,
        type: 'series',
        author_or_director: s.creator,
        year: s.year,
        genre: s.genre,
        status: 'watchlist',
        rating: null,
        is_favorite: s.isFavorite,
        is_watchlist: true,
        updated_at: s.updatedAt.toISOString(),
        end_date: null,
      });
    }

    const result = {
      stats,
      continue_watching: continueWatching.slice(0, 9),
      recently_completed: recentlyCompleted.slice(0, 9),
      watchlist_preview: watchlistPreview.slice(0, 9),
    };

    CacheService.setDashboard(userId, result);
    return result;
  }

  static async globalSearch(userId: string, query: string) {
    const uId = new Types.ObjectId(userId);
    const regex = new RegExp(query.trim(), 'i');

    const [movies, series, books, tabSessions] = await Promise.all([
      MovieModel.find({ userId: uId, title: regex }).limit(5),
      SeriesModel.find({ userId: uId, title: regex }).limit(5),
      BookWorkModel.find({ userId: uId, title: regex }).limit(5),
      StashedSessionModel.find({
        userId: uId,
        deletedAt: null,
        $or: [{ title: regex }, { 'tabs.title': regex }, { 'tabs.url': regex }],
      }).limit(5),
    ]);

    return {
      movies: movies.map((m: any) => ({ public_id: m.publicId, title: m.title, type: 'movie' })),
      series: series.map((s: any) => ({ public_id: s.publicId, title: s.title, type: 'series' })),
      books: books.map((b: any) => ({ public_id: b.publicId, title: b.title, type: 'book' })),
      tab_sessions: tabSessions.map((t: any) => ({ id: t.sessionId, title: t.title, type: 'tab_stash', tabCount: t.tabs.length })),
    };
  }
}
