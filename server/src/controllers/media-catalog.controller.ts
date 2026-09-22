import { Request, Response } from 'express';
import { mediaCatalogService } from '../services/catalog/media-catalog.service';
import type { MediaCatalogType } from '../types/media-catalog.types';

export class MediaCatalogController {
  async search(req: Request, res: Response): Promise<void> {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      if (!q) {
        res.status(200).json({ results: [] });
        return;
      }

      const rawType = typeof req.query.type === 'string' ? req.query.type.toLowerCase() : 'all';
      const type: MediaCatalogType = (rawType === 'movie' || rawType === 'series' || rawType === 'all')
        ? rawType
        : 'all';

      const results = await mediaCatalogService.search(q, type);
      res.status(200).json({ results });
    } catch (error) {
      console.error('[MediaCatalogController] Search error:', error);
      res.status(500).json({ message: 'Internal server error searching media catalog' });
    }
  }

  async getDetails(req: Request, res: Response): Promise<void> {
    try {
      const type = req.params.type as string;
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

      if (type !== 'movie' && type !== 'series') {
        res.status(400).json({ message: 'Invalid media type. Must be "movie" or "series".' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'Missing media ID parameter' });
        return;
      }

      const item = await mediaCatalogService.getDetails(id, type);
      if (!item) {
        res.status(404).json({ message: 'Media item not found in catalog' });
        return;
      }

      res.status(200).json({ item });
    } catch (error) {
      console.error('[MediaCatalogController] GetDetails error:', error);
      res.status(500).json({ message: 'Internal server error retrieving media catalog details' });
    }
  }
}

export const mediaCatalogController = new MediaCatalogController();
