import { MovieModel } from '../models/movie.model';
import { SeriesModel } from '../models/series.model';
import { BookWorkModel, BookItemModel } from '../models/book.model';
import { StashedSessionModel } from '../models/session.model';
import { MediaSessionModel } from '../models/media-session.model';
import { Types } from 'mongoose';

export class DashboardService {
  static async getDashboardStats(userId: string) {
    const uId = new Types.ObjectId(userId);

    const totalMovies = await MovieModel.countDocuments({ userId: uId });
    const totalSeries = await SeriesModel.countDocuments({ userId: uId });
    const totalBooks = await BookItemModel.countDocuments({ userId: uId });
    const totalStashedTabs = await StashedSessionModel.countDocuments({ userId: uId, deletedAt: null });

    const watching = await MediaSessionModel.countDocuments({
      userId: uId,
      mediaType: { $in: ['movie', 'series'] },
      status: 'watching',
    });

    const reading = await MediaSessionModel.countDocuments({
      userId: uId,
      mediaType: 'book',
      status: 'reading',
    });

    const completed = await MediaSessionModel.countDocuments({
      userId: uId,
      status: 'completed',
    });

    const watchlistMovies = await MovieModel.countDocuments({ userId: uId, isWatchlist: true });
    const watchlistSeries = await SeriesModel.countDocuments({ userId: uId, isWatchlist: true });
    const wishlistBooks = await BookItemModel.countDocuments({ userId: uId, ownershipStatus: 'Wishlist' });

    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const completedThisMonth = await MediaSessionModel.countDocuments({
      userId: uId,
      status: 'completed',
      endDate: { $gte: firstDayOfMonth },
    });

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
    const uId = new Types.ObjectId(userId);
    const stats = await this.getDashboardStats(userId);

    // 1. Continue Watching / Reading (Top 9)
    const activeSessions = await MediaSessionModel.find({
      userId: uId,
      status: { $in: ['watching', 'reading'] },
    })
      .sort({ updatedAt: -1 })
      .limit(15);

    const continueWatching: any[] = [];
    for (const session of activeSessions) {
      if (session.mediaType === 'movie') {
        const movie = await MovieModel.findById(session.mediaId);
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
            updated_at: movie.updatedAt.toISOString(),
            end_date: session.endDate ? session.endDate.toISOString() : null,
          });
        }
      } else if (session.mediaType === 'series') {
        const series = await SeriesModel.findById(session.mediaId);
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
            updated_at: series.updatedAt.toISOString(),
            end_date: session.endDate ? session.endDate.toISOString() : null,
          });
        }
      } else if (session.mediaType === 'book') {
        const bookItem = await BookItemModel.findById(session.mediaId).populate({
          path: 'editionId',
          populate: { path: 'bookId', populate: { path: 'authors' } },
        });
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
            updated_at: bookItem.updatedAt.toISOString(),
            end_date: session.endDate ? session.endDate.toISOString() : null,
          });
        }
      }
    }

    // 2. Recently Completed (Top 9)
    const completedSessions = await MediaSessionModel.find({
      userId: uId,
      status: 'completed',
    })
      .sort({ endDate: -1, updatedAt: -1 })
      .limit(9);

    const recentlyCompleted: any[] = [];
    for (const session of completedSessions) {
      if (session.mediaType === 'movie') {
        const movie = await MovieModel.findById(session.mediaId);
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
            updated_at: movie.updatedAt.toISOString(),
            end_date: session.endDate ? session.endDate.toISOString() : null,
          });
        }
      } else if (session.mediaType === 'series') {
        const series = await SeriesModel.findById(session.mediaId);
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
            updated_at: series.updatedAt.toISOString(),
            end_date: session.endDate ? session.endDate.toISOString() : null,
          });
        }
      }
    }

    // 3. Watchlist & Wishlist Preview (Top 9)
    const wlMovies = await MovieModel.find({ userId: uId, isWatchlist: true }).sort({ updatedAt: -1 }).limit(5);
    const wlSeries = await SeriesModel.find({ userId: uId, isWatchlist: true }).sort({ updatedAt: -1 }).limit(5);

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

    return {
      stats,
      continue_watching: continueWatching.slice(0, 9),
      recently_completed: recentlyCompleted.slice(0, 9),
      watchlist_preview: watchlistPreview.slice(0, 9),
    };
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
