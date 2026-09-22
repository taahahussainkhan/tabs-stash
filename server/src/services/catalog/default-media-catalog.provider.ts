import https from 'https';
import { env } from '../../config/env';
import type {
  IMediaCatalogProvider,
  MediaCatalogItemDetails,
  MediaCatalogSearchResult,
  MediaCatalogSeasonStructure,
  MediaCatalogType,
} from './catalog-provider.interface';

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export class DefaultMediaCatalogProvider implements IMediaCatalogProvider {
  public readonly name = 'DefaultHttpMediaProvider';
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  private get apiKey(): string {
    return env.MEDIA_CATALOG_API_KEY || '';
  }

  private requestJson<T>(path: string, params: Record<string, string | number> = {}): Promise<T | null> {
    return new Promise((resolve) => {
      if (!this.apiKey) {
        console.warn('[MediaCatalogProvider] MEDIA_CATALOG_API_KEY is not configured');
        return resolve(null);
      }

      const queryParams = new URLSearchParams({
        api_key: this.apiKey,
        ...Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
      });

      const url = `${this.baseUrl}${path}${path.includes('?') ? '&' : '?'}${queryParams.toString()}`;

      const req = https.get(
        url,
        {
          headers: {
            'User-Agent': 'Lore-Catalog/3.0.0',
            Accept: 'application/json',
          },
          timeout: 6000,
        },
        (res) => {
          if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
            console.warn(`[MediaCatalogProvider] Request failed with status ${res.statusCode} for ${path}`);
            res.resume();
            return resolve(null);
          }

          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data) as T;
              resolve(parsed);
            } catch (err) {
              console.error('[MediaCatalogProvider] Failed to parse JSON response:', err);
              resolve(null);
            }
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        console.warn(`[MediaCatalogProvider] Request timed out for ${path}`);
        resolve(null);
      });

      req.on('error', (err) => {
        console.error(`[MediaCatalogProvider] Network error for ${path}:`, err.message);
        resolve(null);
      });
    });
  }

  async search(query: string, type: MediaCatalogType = 'all'): Promise<MediaCatalogSearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    let path = '/search/multi';
    if (type === 'movie') path = '/search/movie';
    else if (type === 'series') path = '/search/tv';

    const response = await this.requestJson<{
      results?: Array<{
        id: number;
        title?: string;
        name?: string;
        media_type?: string;
        release_date?: string;
        first_air_date?: string;
        poster_path?: string | null;
        overview?: string;
        genre_ids?: number[];
        vote_average?: number;
      }>;
    }>(path, { query: trimmed });

    if (!response?.results || !Array.isArray(response.results)) {
      return [];
    }

    return response.results
      .filter((item) => {
        const itemType = item.media_type || (type === 'all' ? 'movie' : type === 'series' ? 'tv' : 'movie');
        return itemType === 'movie' || itemType === 'tv';
      })
      .slice(0, 10)
      .map((item) => {
        const itemType = item.media_type || (type === 'series' ? 'tv' : 'movie');
        const isMovie = itemType === 'movie';
        const rawDate = isMovie ? item.release_date : item.first_air_date;
        const year = rawDate ? parseInt(rawDate.slice(0, 4), 10) || null : null;
        const genres = (item.genre_ids || [])
          .map((id) => GENRE_MAP[id])
          .filter(Boolean);

        return {
          id: String(item.id),
          title: (isMovie ? item.title : item.name) || 'Untitled',
          type: isMovie ? 'movie' : 'series',
          year,
          creator: null,
          posterUrl: item.poster_path ? `${this.imageBaseUrl}${item.poster_path}` : null,
          overview: item.overview || null,
          genres,
          voteAverage: item.vote_average || null,
        };
      });
  }

  async getDetails(id: string, type: 'movie' | 'series'): Promise<MediaCatalogItemDetails | null> {
    if (!id) return null;

    if (type === 'movie') {
      const data = await this.requestJson<{
        id: number;
        title: string;
        release_date?: string;
        poster_path?: string | null;
        overview?: string;
        genres?: Array<{ id: number; name: string }>;
        runtime?: number;
        credits?: {
          crew?: Array<{ job: string; name: string }>;
        };
      }>(`/movie/${id}`, { append_to_response: 'credits' });

      if (!data) return null;

      const director = data.credits?.crew?.find((c) => c.job === 'Director')?.name || null;
      const year = data.release_date ? parseInt(data.release_date.slice(0, 4), 10) || null : null;
      const genres = data.genres?.map((g) => g.name) || [];

      return {
        id: String(data.id),
        title: data.title || 'Untitled',
        type: 'movie',
        year,
        creator: director,
        posterUrl: data.poster_path ? `${this.imageBaseUrl}${data.poster_path}` : null,
        overview: data.overview || null,
        genres,
        runtimeMinutes: data.runtime || null,
      };
    }

    if (type === 'series') {
      const data = await this.requestJson<{
        id: number;
        name: string;
        first_air_date?: string;
        poster_path?: string | null;
        overview?: string;
        genres?: Array<{ id: number; name: string }>;
        episode_run_time?: number[];
        created_by?: Array<{ name: string }>;
        seasons?: Array<{
          season_number: number;
          episode_count: number;
          name?: string;
          air_date?: string;
        }>;
      }>(`/tv/${id}`);

      if (!data) return null;

      const creator = data.created_by?.[0]?.name || null;
      const year = data.first_air_date ? parseInt(data.first_air_date.slice(0, 4), 10) || null : null;
      const genres = data.genres?.map((g) => g.name) || [];

      // Filter out Season 0 (Specials) and fetch each season's episode titles & runtimes
      const validSeasons = (data.seasons || []).filter((s) => s.season_number > 0);
      const defaultDuration = data.episode_run_time?.[0] || null;

      const seasonDetailsPromises = validSeasons.map(async (s) => {
        try {
          const seasonData = await this.requestJson<{
            season_number: number;
            name?: string;
            episodes?: Array<{
              episode_number: number;
              name?: string;
              runtime?: number | null;
              overview?: string | null;
            }>;
          }>(`/tv/${id}/season/${s.season_number}`);

          const episodes = (seasonData?.episodes || []).map((ep) => ({
            episodeNumber: ep.episode_number,
            title: ep.name || `Episode ${ep.episode_number}`,
            duration: ep.runtime || defaultDuration,
            overview: ep.overview || null,
          }));

          return {
            seasonNumber: s.season_number,
            episodeCount: s.episode_count || episodes.length || 1,
            title: s.name || seasonData?.name || `Season ${s.season_number}`,
            year: s.air_date ? parseInt(s.air_date.slice(0, 4), 10) || undefined : undefined,
            episodes: episodes.length > 0 ? episodes : undefined,
          };
        } catch (err) {
          console.warn(`[MediaCatalogProvider] Failed to fetch season ${s.season_number} for tv/${id}:`, err);
          return {
            seasonNumber: s.season_number,
            episodeCount: s.episode_count || 1,
            title: s.name || `Season ${s.season_number}`,
            year: s.air_date ? parseInt(s.air_date.slice(0, 4), 10) || undefined : undefined,
          };
        }
      });

      const seasons = await Promise.all(seasonDetailsPromises);

      return {
        id: String(data.id),
        title: data.name || 'Untitled',
        type: 'series',
        year,
        creator,
        posterUrl: data.poster_path ? `${this.imageBaseUrl}${data.poster_path}` : null,
        overview: data.overview || null,
        genres,
        runtimeMinutes: data.episode_run_time?.[0] || null,
        seasons,
      };
    }

    return null;
  }
}
