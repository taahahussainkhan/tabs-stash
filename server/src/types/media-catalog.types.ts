export type MediaCatalogType = 'movie' | 'series' | 'all';

export interface MediaCatalogSearchResult {
  id: string;
  title: string;
  type: 'movie' | 'series';
  year: number | null;
  creator: string | null;
  posterUrl: string | null;
  overview: string | null;
  genres: string[];
  voteAverage?: number | null;
}

export interface MediaCatalogEpisodeDetails {
  episodeNumber: number;
  title: string;
  duration?: number | null;
  overview?: string | null;
}

export interface MediaCatalogSeasonStructure {
  seasonNumber: number;
  episodeCount: number;
  title?: string;
  year?: number;
  episodes?: MediaCatalogEpisodeDetails[];
}

export interface MediaCatalogItemDetails {
  id: string;
  title: string;
  type: 'movie' | 'series';
  year: number | null;
  creator: string | null;
  posterUrl: string | null;
  overview: string | null;
  genres: string[];
  runtimeMinutes: number | null;
  seasons?: MediaCatalogSeasonStructure[];
}

export interface IMediaCatalogProvider {
  readonly name: string;
  search(query: string, type?: MediaCatalogType): Promise<MediaCatalogSearchResult[]>;
  getDetails(id: string, type: 'movie' | 'series'): Promise<MediaCatalogItemDetails | null>;
}
