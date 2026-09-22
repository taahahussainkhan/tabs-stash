import { CacheService } from '../cache.service';
import { CatalogMediaModel, type ICatalogMedia } from '../../models/catalog-media.model';
import type {
  IMediaCatalogProvider,
  MediaCatalogItemDetails,
  MediaCatalogSearchResult,
  MediaCatalogType,
} from './catalog-provider.interface';
import { DefaultMediaCatalogProvider } from './default-media-catalog.provider';

export class MediaCatalogService {
  private static instance: MediaCatalogService;
  private providers: Map<string, IMediaCatalogProvider> = new Map();
  private defaultProviderName: string = 'DefaultHttpMediaProvider';

  private constructor() {
    const defaultProvider = new DefaultMediaCatalogProvider();
    this.registerProvider(defaultProvider, true);
  }

  public static getInstance(): MediaCatalogService {
    if (!MediaCatalogService.instance) {
      MediaCatalogService.instance = new MediaCatalogService();
    }
    return MediaCatalogService.instance;
  }

  public registerProvider(provider: IMediaCatalogProvider, isDefault: boolean = false): void {
    this.providers.set(provider.name, provider);
    if (isDefault) {
      this.defaultProviderName = provider.name;
    }
  }

  private getActiveProvider(): IMediaCatalogProvider {
    const provider = this.providers.get(this.defaultProviderName);
    if (!provider) {
      throw new Error(`Catalog provider "${this.defaultProviderName}" not found`);
    }
    return provider;
  }

  private mapCatalogDocToDetails(doc: ICatalogMedia): MediaCatalogItemDetails {
    return {
      id: doc.externalId,
      title: doc.title,
      type: doc.type,
      year: doc.year ?? null,
      creator: doc.creator ?? null,
      posterUrl: doc.posterUrl ?? null,
      overview: doc.overview ?? null,
      genres: doc.genres || [],
      runtimeMinutes: doc.runtimeMinutes ?? null,
      seasons: doc.seasons?.map((s) => ({
        seasonNumber: s.seasonNumber,
        episodeCount: s.episodeCount,
        title: s.title || `Season ${s.seasonNumber}`,
        year: s.year ?? undefined,
        episodes: s.episodes?.map((e) => ({
          episodeNumber: e.episodeNumber,
          title: e.title,
          duration: e.duration ?? null,
          overview: e.overview ?? null,
        })),
      })),
    };
  }

  public async findCanonicalByTitle(
    title: string,
    type: 'movie' | 'series'
  ): Promise<MediaCatalogItemDetails | null> {
    const sanitized = title.trim().toLowerCase();
    if (!sanitized) return null;

    try {
      const doc = await CatalogMediaModel.findOne({
        titleLower: sanitized,
        type,
      });

      if (doc) {
        return this.mapCatalogDocToDetails(doc);
      }
    } catch (err) {
      console.warn('[MediaCatalogService] findCanonicalByTitle error:', err);
    }

    return null;
  }

  public async search(
    query: string,
    type: MediaCatalogType = 'all'
  ): Promise<MediaCatalogSearchResult[]> {
    const sanitized = query.trim().toLowerCase();
    if (!sanitized) return [];

    const cacheKey = `catalog:search:${type}:${sanitized}`;
    const cached = CacheService.get<MediaCatalogSearchResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const provider = this.getActiveProvider();
      const results = await provider.search(query, type);

      // Cache search results for 15 minutes (900 seconds)
      CacheService.set(cacheKey, results, 900);
      return results;
    } catch (err) {
      console.error('[MediaCatalogService] Search error:', err);
      return [];
    }
  }

  public async getDetails(
    id: string,
    type: 'movie' | 'series'
  ): Promise<MediaCatalogItemDetails | null> {
    const trimmedId = id.trim();
    if (!trimmedId) return null;

    const cacheKey = `catalog:details:${type}:${trimmedId}`;
    const cached = CacheService.get<MediaCatalogItemDetails>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // 1. Check local MongoDB shared catalog first (instant hit, 0 external calls)
      const existingDoc = await CatalogMediaModel.findOne({
        externalId: trimmedId,
        type,
      });

      if (existingDoc) {
        // If series has seasons with episodes, we have complete canonical data
        const hasCompleteEpisodes = type === 'movie' || (existingDoc.seasons && existingDoc.seasons.length > 0 && existingDoc.seasons.every(s => s.episodes && s.episodes.length > 0));
        if (hasCompleteEpisodes) {
          const details = this.mapCatalogDocToDetails(existingDoc);
          CacheService.set(cacheKey, details, 86400);
          return details;
        }
      }

      // 2. Not in local database or incomplete, fetch from external provider
      const provider = this.getActiveProvider();
      const details = await provider.getDetails(trimmedId, type);

      if (details) {
        // 3. Persist to MongoDB shared catalog so all other users get it locally
        try {
          await CatalogMediaModel.findOneAndUpdate(
            { externalId: trimmedId, type, externalSource: 'tmdb' },
            {
              externalId: trimmedId,
              externalSource: 'tmdb',
              type,
              title: details.title,
              titleLower: details.title.toLowerCase().trim(),
              year: details.year ?? null,
              creator: details.creator ?? null,
              posterUrl: details.posterUrl ?? null,
              overview: details.overview ?? null,
              genres: details.genres || [],
              runtimeMinutes: details.runtimeMinutes ?? null,
              seasons: details.seasons?.map((s) => ({
                seasonNumber: s.seasonNumber,
                episodeCount: s.episodeCount,
                title: s.title || `Season ${s.seasonNumber}`,
                year: s.year ?? null,
                episodes: s.episodes?.map((e) => ({
                  episodeNumber: e.episodeNumber,
                  title: e.title,
                  duration: e.duration ?? null,
                  overview: e.overview ?? null,
                })) || [],
              })),
            },
            { upsert: true, new: true }
          );
        } catch (dbErr) {
          console.warn('[MediaCatalogService] Failed to persist canonical media to MongoDB:', dbErr);
        }

        // Cache detailed item info for 24 hours (86400 seconds)
        CacheService.set(cacheKey, details, 86400);
      }

      return details;
    } catch (err) {
      console.error(`[MediaCatalogService] GetDetails error for ${type}/${id}:`, err);
      return null;
    }
  }
}

export const mediaCatalogService = MediaCatalogService.getInstance();
