import { CatalogMediaModel, ICatalogMedia } from '../../models/catalog-media.model';
import { mediaCatalogService } from '../catalog/media-catalog.service';
import { logger } from '../../utils/logger';

export interface EnrichableMedia {
  title: string;
  externalId?: string | null;
  director?: string | null;
  creator?: string | null;
  year?: number | null;
  genre?: string | null;
  posterImage?: string | null;
  durationMinutes?: number | null;
}

export async function enrichMediaFromCatalog<T extends EnrichableMedia>(
  data: T,
  mediaType: 'movie' | 'series'
): Promise<{ enrichedData: T; catalogDoc: ICatalogMedia | null }> {
  let catalogDoc: ICatalogMedia | null = null;
  const enriched = { ...data };

  if (enriched.title || enriched.externalId) {
    try {
      let details: any = null;
      if (enriched.externalId) {
        details = await mediaCatalogService.getDetails(String(enriched.externalId), mediaType);
      }
      if (!details && enriched.title) {
        details = await mediaCatalogService.findCanonicalByTitle(enriched.title, mediaType);
      }
      if (!details && enriched.title) {
        const searchResults = await mediaCatalogService.search(enriched.title, mediaType);
        if (searchResults && searchResults.length > 0) {
          const match =
            searchResults.find((r) => r.title.toLowerCase() === enriched.title.toLowerCase()) ||
            searchResults[0];
          details = await mediaCatalogService.getDetails(match.id, mediaType);
        }
      }

      if (details) {
        if (!enriched.director && details.creator) enriched.director = details.creator;
        if (!enriched.creator && details.creator) enriched.creator = details.creator;
        if (!enriched.year && details.year) enriched.year = details.year;
        if (!enriched.genre && details.genres?.length) enriched.genre = details.genres.join(', ');
        if (!enriched.posterImage && details.posterUrl) enriched.posterImage = details.posterUrl;
        if (!enriched.durationMinutes && details.runtimeMinutes) enriched.durationMinutes = details.runtimeMinutes;
        if (!enriched.externalId && details.id) enriched.externalId = details.id;

        catalogDoc = await CatalogMediaModel.findOne({ externalId: details.id, type: mediaType });
      }
    } catch (err) {
      logger.warn(`[CatalogEnrichment] Auto-enrich ${mediaType} from catalog failed:`, err);
    }
  }

  if (!catalogDoc && enriched.externalId) {
    catalogDoc = await CatalogMediaModel.findOne({
      externalId: String(enriched.externalId),
      type: mediaType,
    });
  }
  if (!catalogDoc && enriched.title) {
    catalogDoc = await CatalogMediaModel.findOne({
      titleLower: enriched.title.trim().toLowerCase(),
      type: mediaType,
    });
  }

  return { enrichedData: enriched, catalogDoc };
}
