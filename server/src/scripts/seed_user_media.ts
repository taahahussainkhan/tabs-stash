import mongoose, { Types } from 'mongoose';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';
import { MovieModel, IMovie } from '../models/movie.model';
import { SeriesModel, ISeries, ISeason, IEpisode } from '../models/series.model';
import { MediaSessionModel } from '../models/media-session.model';
import { mediaCatalogService } from '../services/catalog/media-catalog.service';
import { enrichMediaFromCatalog } from '../services/helpers/catalog-enrichment';
import { randomUUID } from 'crypto';

interface SeedMovieConfig {
  title: string;
  tmdbQuery?: string;
  year?: number;
  status: 'completed' | 'watching';
  startDate: Date;
  endDate?: Date | null;
  isRewatch?: boolean;
}

interface SeedSeriesConfig {
  title: string;
  tmdbQuery?: string;
  year?: number;
  status: 'completed' | 'watching';
  startDate: Date;
  endDate?: Date | null;
  isRewatch?: boolean;
  completeAllSeasons?: boolean;
  completedSeasons?: number[];
  watchedEpisodesMap?: Record<number, number[]>; // seasonNumber -> [episodeNumbers]
}

const MOVIES_TO_SEED: SeedMovieConfig[] = [
  {
    title: 'Blue Streak',
    tmdbQuery: 'Blue Streak',
    year: 1999,
    status: 'completed',
    startDate: new Date('2025-12-14T01:26:00.000Z'),
    endDate: new Date('2025-12-14T11:55:00.000Z'),
  },
  {
    title: 'Halloween',
    tmdbQuery: 'Halloween',
    year: 1978,
    status: 'watching',
    startDate: new Date('2025-12-20T14:31:00.000Z'),
  },
  {
    title: 'Interstellar',
    tmdbQuery: 'Interstellar',
    year: 2014,
    status: 'watching',
    startDate: new Date('2026-01-24T14:08:00.000Z'),
    isRewatch: true,
  },
  {
    title: 'El Camino: A Breaking Bad Movie',
    tmdbQuery: 'El Camino: A Breaking Bad Movie',
    year: 2019,
    status: 'completed',
    startDate: new Date('2026-05-11T20:58:00.000Z'),
    endDate: new Date('2026-05-13T22:22:00.000Z'),
  },
  {
    title: 'Europa Report',
    tmdbQuery: 'Europa Report',
    year: 2013,
    status: 'completed',
    startDate: new Date('2026-05-20T23:00:00.000Z'),
    endDate: new Date('2026-05-21T01:51:00.000Z'),
  },
  {
    title: 'The Mist',
    tmdbQuery: 'The Mist',
    year: 2007,
    status: 'completed',
    startDate: new Date('2026-05-24T15:41:00.000Z'),
    endDate: new Date('2026-05-25T17:22:00.000Z'),
  },
  {
    title: 'Bhoot Bangla',
    tmdbQuery: 'Bhoot Bangla',
    status: 'completed',
    startDate: new Date('2026-06-13T14:14:00.000Z'),
    endDate: new Date('2026-06-13T20:42:00.000Z'),
  },
  {
    title: 'Journey to the Center of the Earth',
    tmdbQuery: 'Journey to the Center of the Earth',
    year: 2008,
    status: 'watching',
    startDate: new Date('2026-07-13T00:01:00.000Z'),
  },
  {
    title: 'Cocktail',
    tmdbQuery: 'Cocktail',
    year: 2012,
    status: 'completed',
    startDate: new Date('2026-07-22T19:59:00.000Z'),
    endDate: new Date('2026-07-24T00:54:00.000Z'),
  },
  {
    title: 'Raat Akeli Hai',
    tmdbQuery: 'Raat Akeli Hai',
    year: 2020,
    status: 'watching',
    startDate: new Date('2026-07-25T19:37:00.000Z'),
  },
  {
    title: 'Spider-Man',
    tmdbQuery: 'Spider-Man',
    year: 2002,
    status: 'completed',
    startDate: new Date('2026-08-08T13:18:00.000Z'),
    endDate: new Date('2026-08-09T16:58:00.000Z'),
  },
  {
    title: 'Spider-Man 2',
    tmdbQuery: 'Spider-Man 2',
    year: 2004,
    status: 'completed',
    startDate: new Date('2026-08-09T20:07:00.000Z'),
    endDate: new Date('2026-08-13T01:45:00.000Z'),
  },
  {
    title: 'The Last House on the Left',
    tmdbQuery: 'The Last House on the Left',
    year: 2009,
    status: 'completed',
    startDate: new Date('2026-08-14T00:25:00.000Z'),
    endDate: new Date('2026-08-14T12:50:00.000Z'),
  },
  {
    title: 'Main Wapis Aaunga',
    tmdbQuery: 'Main Wapis Aaunga',
    status: 'completed',
    startDate: new Date('2026-08-14T19:58:00.000Z'),
    endDate: new Date('2026-08-15T14:19:00.000Z'),
  },
  {
    title: 'Ikka',
    tmdbQuery: 'Ikka',
    year: 2020,
    status: 'completed',
    startDate: new Date('2026-08-15T15:46:00.000Z'),
    endDate: new Date('2026-08-15T19:31:00.000Z'),
  },
  {
    title: 'Godzilla',
    tmdbQuery: 'Godzilla',
    year: 2014,
    status: 'completed',
    startDate: new Date('2026-09-10T00:33:00.000Z'),
    endDate: new Date('2026-09-12T02:50:00.000Z'),
  },
  // MCU Marathon Movies
  {
    title: 'Iron Man',
    tmdbQuery: 'Iron Man',
    year: 2008,
    status: 'completed',
    startDate: new Date('2026-09-02T14:45:00.000Z'),
    endDate: new Date('2026-09-04T12:21:00.000Z'),
  },
  {
    title: 'Iron Man 2',
    tmdbQuery: 'Iron Man 2',
    year: 2010,
    status: 'completed',
    startDate: new Date('2026-09-04T13:31:00.000Z'),
    endDate: new Date('2026-09-05T01:20:00.000Z'),
  },
  {
    title: 'Thor',
    tmdbQuery: 'Thor',
    year: 2011,
    status: 'completed',
    startDate: new Date('2026-09-05T11:12:00.000Z'),
    endDate: new Date('2026-09-05T17:57:00.000Z'),
  },
  {
    title: 'Captain America: The First Avenger',
    tmdbQuery: 'Captain America: The First Avenger',
    year: 2011,
    status: 'completed',
    startDate: new Date('2026-09-05T18:23:00.000Z'),
    endDate: new Date('2026-09-06T15:03:00.000Z'),
  },
  {
    title: 'The Avengers',
    tmdbQuery: 'The Avengers',
    year: 2012,
    status: 'completed',
    startDate: new Date('2026-09-06T15:15:00.000Z'),
    endDate: new Date('2026-09-06T18:30:00.000Z'),
  },
  {
    title: 'Iron Man 3',
    tmdbQuery: 'Iron Man 3',
    year: 2013,
    status: 'completed',
    startDate: new Date('2026-09-12T11:12:00.000Z'),
    endDate: new Date('2026-09-12T15:49:00.000Z'),
  },
  {
    title: 'Thor: The Dark World',
    tmdbQuery: 'Thor: The Dark World',
    year: 2013,
    status: 'completed',
    startDate: new Date('2026-09-12T16:15:00.000Z'),
    endDate: new Date('2026-09-13T00:28:00.000Z'),
  },
  {
    title: 'Guardians of the Galaxy',
    tmdbQuery: 'Guardians of the Galaxy',
    year: 2014,
    status: 'completed',
    startDate: new Date('2026-09-13T00:40:00.000Z'),
    endDate: new Date('2026-09-13T15:39:00.000Z'),
  },
  {
    title: 'Captain America: The Winter Soldier',
    tmdbQuery: 'Captain America: The Winter Soldier',
    year: 2014,
    status: 'completed',
    startDate: new Date('2026-09-13T16:12:00.000Z'),
    endDate: new Date('2026-09-14T01:37:00.000Z'),
  },
  {
    title: 'Avengers: Age of Ultron',
    tmdbQuery: 'Avengers: Age of Ultron',
    year: 2015,
    status: 'completed',
    startDate: new Date('2026-09-14T20:51:00.000Z'),
    endDate: new Date('2026-09-16T20:51:00.000Z'),
  },
  {
    title: 'Ant-Man',
    tmdbQuery: 'Ant-Man',
    year: 2015,
    status: 'completed',
    startDate: new Date('2026-09-16T21:02:00.000Z'),
    endDate: new Date('2026-09-17T01:15:00.000Z'),
  },
  {
    title: 'Captain America: Civil War',
    tmdbQuery: 'Captain America: Civil War',
    year: 2016,
    status: 'completed',
    startDate: new Date('2026-09-17T18:03:00.000Z'),
    endDate: new Date('2026-09-18T17:16:00.000Z'),
  },
  {
    title: 'Doctor Strange',
    tmdbQuery: 'Doctor Strange',
    year: 2016,
    status: 'completed',
    startDate: new Date('2026-09-18T18:12:00.000Z'),
    endDate: new Date('2026-09-19T12:52:00.000Z'),
  },
  {
    title: 'Guardians of the Galaxy Vol. 2',
    tmdbQuery: 'Guardians of the Galaxy Vol. 2',
    year: 2017,
    status: 'completed',
    startDate: new Date('2026-09-19T19:35:00.000Z'),
    endDate: new Date('2026-09-20T00:44:00.000Z'),
  },
  {
    title: 'Thor: Ragnarok',
    tmdbQuery: 'Thor: Ragnarok',
    year: 2017,
    status: 'completed',
    startDate: new Date('2026-09-20T10:39:00.000Z'),
    endDate: new Date('2026-09-20T14:18:00.000Z'),
  },
  {
    title: 'Black Panther',
    tmdbQuery: 'Black Panther',
    year: 2018,
    status: 'completed',
    startDate: new Date('2026-09-20T14:29:00.000Z'),
    endDate: new Date('2026-09-20T18:48:00.000Z'),
  },
  {
    title: 'Avengers: Infinity War',
    tmdbQuery: 'Avengers: Infinity War',
    year: 2018,
    status: 'completed',
    startDate: new Date('2026-09-20T19:16:00.000Z'),
    endDate: new Date('2026-09-21T00:23:00.000Z'),
  },
  {
    title: 'Ant-Man and the Wasp',
    tmdbQuery: 'Ant-Man and the Wasp',
    year: 2018,
    status: 'completed',
    startDate: new Date('2026-09-21T00:41:00.000Z'),
    endDate: new Date('2026-09-21T12:20:00.000Z'),
  },
  {
    title: 'Captain Marvel',
    tmdbQuery: 'Captain Marvel',
    year: 2019,
    status: 'completed',
    startDate: new Date('2026-09-21T12:32:00.000Z'),
    endDate: new Date('2026-09-21T16:52:00.000Z'),
  },
  {
    title: 'Avengers: Endgame',
    tmdbQuery: 'Avengers: Endgame',
    year: 2019,
    status: 'completed',
    startDate: new Date('2026-09-21T16:54:00.000Z'),
    endDate: new Date('2026-09-21T22:12:00.000Z'),
  },
  {
    title: 'The Guardians of the Galaxy Holiday Special',
    tmdbQuery: 'The Guardians of the Galaxy Holiday Special',
    year: 2022,
    status: 'completed',
    startDate: new Date('2026-09-22T01:24:00.000Z'),
    endDate: new Date('2026-09-22T11:11:00.000Z'),
  },
  {
    title: 'Ant-Man and the Wasp: Quantumania',
    tmdbQuery: 'Ant-Man and the Wasp: Quantumania',
    year: 2023,
    status: 'completed',
    startDate: new Date('2026-09-22T11:23:00.000Z'),
    endDate: new Date('2026-09-22T16:27:00.000Z'),
  },
  {
    title: 'Guardians of the Galaxy Vol. 3',
    tmdbQuery: 'Guardians of the Galaxy Vol. 3',
    year: 2023,
    status: 'completed',
    startDate: new Date('2026-09-22T18:01:00.000Z'),
    endDate: new Date('2026-09-22T23:26:00.000Z'),
  },
];

const SERIES_TO_SEED: SeedSeriesConfig[] = [
  {
    title: 'Chernobyl',
    tmdbQuery: 'Chernobyl',
    year: 2019,
    status: 'watching',
    startDate: new Date('2025-12-28T14:17:00.000Z'),
  },
  {
    title: 'Breaking Bad',
    tmdbQuery: 'Breaking Bad',
    year: 2008,
    status: 'completed',
    startDate: new Date('2026-04-22T00:00:00.000Z'),
    endDate: new Date('2026-05-11T00:01:00.000Z'),
    completeAllSeasons: true,
  },
  {
    title: 'Better Call Saul',
    tmdbQuery: 'Better Call Saul',
    year: 2015,
    status: 'watching',
    startDate: new Date('2026-05-13T22:43:00.000Z'),
  },
  {
    title: 'From',
    tmdbQuery: 'From',
    year: 2022,
    status: 'watching',
    startDate: new Date('2026-05-03T19:02:00.000Z'),
    watchedEpisodesMap: {
      4: [3, 4, 5, 6, 8, 9, 10], // Logged episodes for Season 4
    },
  },
  {
    title: 'Dark',
    tmdbQuery: 'Dark',
    year: 2017,
    status: 'watching',
    startDate: new Date('2026-05-17T16:09:00.000Z'),
  },
  {
    title: 'Vikings',
    tmdbQuery: 'Vikings',
    year: 2013,
    status: 'watching',
    startDate: new Date('2026-05-22T23:16:00.000Z'),
    watchedEpisodesMap: {
      1: [1],
    },
  },
  {
    title: 'Game of Thrones',
    tmdbQuery: 'Game of Thrones',
    year: 2011,
    status: 'watching',
    startDate: new Date('2026-05-28T16:29:00.000Z'),
    completedSeasons: [1, 2],
  },
  {
    title: 'The Railway Men',
    tmdbQuery: 'The Railway Men',
    year: 2023,
    status: 'completed',
    startDate: new Date('2026-06-13T21:27:00.000Z'),
    endDate: new Date('2026-06-14T14:34:00.000Z'),
    completeAllSeasons: true,
  },
  {
    title: 'Mandala Murders',
    tmdbQuery: 'Mandala Murders',
    status: 'completed',
    startDate: new Date('2026-06-26T14:30:00.000Z'),
    endDate: new Date('2026-06-27T01:09:00.000Z'),
    completeAllSeasons: true,
  },
  {
    title: 'Aranyak',
    tmdbQuery: 'Aranyak',
    year: 2021,
    status: 'completed',
    startDate: new Date('2026-06-27T13:07:00.000Z'),
    endDate: new Date('2026-06-28T21:00:00.000Z'),
    completeAllSeasons: true,
  },
  {
    title: 'Dahaad',
    tmdbQuery: 'Dahaad',
    year: 2023,
    status: 'watching',
    startDate: new Date('2026-07-03T22:31:00.000Z'),
  },
  {
    title: 'Testament: The Story of Moses',
    tmdbQuery: 'Testament: The Story of Moses',
    year: 2024,
    status: 'completed',
    startDate: new Date('2026-07-11T13:13:00.000Z'),
    endDate: new Date('2026-07-12T01:00:00.000Z'),
    completeAllSeasons: true,
  },
  {
    title: 'Raakh',
    tmdbQuery: 'Raakh',
    year: 2024,
    status: 'completed',
    startDate: new Date('2026-07-12T11:35:00.000Z'),
    endDate: new Date('2026-07-12T21:41:00.000Z'),
    completeAllSeasons: true,
  },
  {
    title: 'Delhi Crime',
    tmdbQuery: 'Delhi Crime',
    year: 2019,
    status: 'watching',
    startDate: new Date('2026-07-15T14:33:00.000Z'),
  },
  {
    title: 'Panchayat',
    tmdbQuery: 'Panchayat',
    year: 2020,
    status: 'watching',
    startDate: new Date('2026-07-15T20:00:00.000Z'),
  },
  {
    title: 'Friends',
    tmdbQuery: 'Friends',
    year: 1994,
    status: 'watching',
    startDate: new Date('2026-07-19T12:54:00.000Z'),
  },
  {
    title: 'The Walking Dead: Dead City',
    tmdbQuery: 'The Walking Dead: Dead City',
    year: 2023,
    status: 'watching',
    startDate: new Date('2026-07-26T13:39:00.000Z'),
    watchedEpisodesMap: {
      3: [1],
    },
  },
  {
    title: 'Kartavya',
    tmdbQuery: 'Kartavya',
    status: 'completed',
    startDate: new Date('2026-07-26T21:05:00.000Z'),
    endDate: new Date('2026-07-27T02:09:00.000Z'),
    completeAllSeasons: true,
  },
  {
    title: 'Ranjha Ranjha Kardi',
    tmdbQuery: 'Ranjha Ranjha Kardi',
    status: 'watching',
    startDate: new Date('2026-02-14T16:51:00.000Z'),
    isRewatch: true,
  },
  {
    title: 'Shehr-e-Zaat',
    tmdbQuery: 'Shehr-e-Zaat',
    status: 'watching',
    startDate: new Date('2026-08-01T00:30:00.000Z'),
  },
  {
    title: 'O Rangreza',
    tmdbQuery: 'O Rangreza',
    status: 'watching',
    startDate: new Date('2026-08-13T23:01:00.000Z'),
  },
  {
    title: 'Kafeel',
    tmdbQuery: 'Kafeel',
    status: 'completed',
    startDate: new Date('2026-08-20T00:00:00.000Z'),
    endDate: new Date('2026-08-21T20:22:00.000Z'),
    completeAllSeasons: true,
  },
  {
    title: 'Sang-e-Mar Mar',
    tmdbQuery: 'Sang-e-Mar Mar',
    status: 'watching',
    startDate: new Date('2026-08-22T12:28:00.000Z'),
  },
  {
    title: 'Yakeen Ka Safar',
    tmdbQuery: 'Yakeen Ka Safar',
    status: 'watching',
    startDate: new Date('2026-08-23T14:28:00.000Z'),
  },
  {
    title: 'Bin Roye',
    tmdbQuery: 'Bin Roye',
    status: 'completed',
    startDate: new Date('2026-08-23T17:00:00.000Z'),
    endDate: new Date('2026-08-27T00:15:00.000Z'),
    completeAllSeasons: true,
  },
  {
    title: 'Supernatural',
    tmdbQuery: 'Supernatural',
    year: 2005,
    status: 'watching',
    startDate: new Date('2026-08-23T23:50:00.000Z'),
  },
  {
    title: 'Hum Kahan Ke Sachay Thay',
    tmdbQuery: 'Hum Kahan Ke Sachay Thay',
    status: 'watching',
    startDate: new Date('2026-08-31T21:58:00.000Z'),
    isRewatch: true,
  },
  {
    title: 'YOU',
    tmdbQuery: 'YOU',
    year: 2018,
    status: 'completed',
    startDate: new Date('2026-09-06T18:31:00.000Z'),
    endDate: new Date('2026-09-11T18:32:00.000Z'),
    completedSeasons: [1],
  },
];

async function seedUserMedia() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected successfully.');

  const targetEmail = 'taaha128@gmail.com';
  const user = await UserModel.findOne({ email: targetEmail });
  if (!user) {
    throw new Error(`User not found with email: ${targetEmail}`);
  }

  console.log(`Target user found: ${user.email} (${user._id})`);

  let moviesCreated = 0;
  let moviesUpdated = 0;
  let seriesCreated = 0;
  let seriesUpdated = 0;

  // 1. Seed Movies
  console.log('\n--- Seeding Movies ---');
  for (const m of MOVIES_TO_SEED) {
    console.log(`Processing movie: "${m.title}"...`);
    const { enrichedData, catalogDoc } = await enrichMediaFromCatalog(
      {
        title: m.tmdbQuery || m.title,
        year: m.year,
      },
      'movie'
    );

    let movie = await MovieModel.findOne({
      userId: user._id,
      title: { $regex: new RegExp(`^${m.title}$`, 'i') },
    });

    const moviePayload: any = {
      userId: user._id,
      title: enrichedData.title || m.title,
      director: enrichedData.director || null,
      year: enrichedData.year || m.year || null,
      genre: enrichedData.genre || null,
      posterImage: enrichedData.posterImage || null,
      durationMinutes: enrichedData.durationMinutes || null,
      catalogId: catalogDoc?._id || null,
      externalId: enrichedData.externalId || null,
      isFavorite: false,
      isWatchlist: false,
    };

    if (!movie) {
      movie = await MovieModel.create({
        ...moviePayload,
        publicId: randomUUID(),
      });
      moviesCreated++;
      console.log(`  ➕ Created movie: ${movie.title} (ID: ${movie._id})`);
    } else {
      await MovieModel.updateOne({ _id: movie._id }, { $set: moviePayload });
      moviesUpdated++;
      console.log(`  🔄 Updated movie: ${movie.title} (ID: ${movie._id})`);
    }

    // Upsert Media Session
    let session = await MediaSessionModel.findOne({
      userId: user._id,
      mediaId: movie._id,
      mediaType: 'movie',
    });

    const sessionPayload: any = {
      userId: user._id,
      mediaId: movie._id,
      mediaType: 'movie',
      status: m.status,
      startDate: m.startDate,
      endDate: m.endDate || null,
      isRewatch: m.isRewatch || false,
    };

    if (!session) {
      session = await MediaSessionModel.create({
        ...sessionPayload,
        publicId: randomUUID(),
      });
      console.log(`  ➕ Created session for ${movie.title} (${m.status})`);
    } else {
      await MediaSessionModel.updateOne({ _id: session._id }, { $set: sessionPayload });
      console.log(`  🔄 Updated session for ${movie.title} (${m.status})`);
    }

    await MovieModel.updateOne({ _id: movie._id }, { $set: { currentSessionId: session._id } });
  }

  // 2. Seed Series
  console.log('\n--- Seeding Series ---');
  for (const s of SERIES_TO_SEED) {
    console.log(`Processing series: "${s.title}"...`);
    const { enrichedData, catalogDoc } = await enrichMediaFromCatalog(
      {
        title: s.tmdbQuery || s.title,
        year: s.year,
      },
      'series'
    );

    // Build Seasons & Episodes Structure
    let seasons: ISeason[] = [];
    if (catalogDoc && catalogDoc.seasons && catalogDoc.seasons.length > 0) {
      seasons = catalogDoc.seasons.map((catSeason) => {
        const seasonNum = catSeason.seasonNumber;
        const isSeasonCompleted =
          s.completeAllSeasons || (s.completedSeasons && s.completedSeasons.includes(seasonNum));

        const episodes: IEpisode[] = (catSeason.episodes || []).map((catEp) => {
          const epNum = catEp.episodeNumber;
          const isWatched =
            isSeasonCompleted ||
            (s.watchedEpisodesMap &&
              s.watchedEpisodesMap[seasonNum] &&
              s.watchedEpisodesMap[seasonNum].includes(epNum));

          return {
            publicId: randomUUID(),
            episodeNumber: epNum,
            title: catEp.title || `Episode ${epNum}`,
            duration: catEp.duration || null,
            isWatched: !!isWatched,
            watchedDate: isWatched ? (s.endDate || s.startDate) : null,
            currentTimestamp: isWatched ? (catEp.duration ? catEp.duration * 60 : 0) : 0,
            rating: null,
            notes: null,
          } as IEpisode;
        });

        return {
          publicId: randomUUID(),
          seasonNumber: seasonNum,
          title: catSeason.title || `Season ${seasonNum}`,
          year: catSeason.year || null,
          episodeCount: catSeason.episodeCount || episodes.length,
          notes: null,
          episodes,
        } as ISeason;
      });
    }

    // Fallback if no catalog seasons found (e.g. niche Pakistani drama not full on TMDB)
    if (seasons.length === 0) {
      seasons = [
        {
          publicId: randomUUID(),
          seasonNumber: 1,
          title: 'Season 1',
          year: s.year || null,
          episodeCount: 1,
          notes: null,
          episodes: [
            {
              publicId: randomUUID(),
              episodeNumber: 1,
              title: 'Episode 1',
              duration: null,
              isWatched: s.status === 'completed',
              watchedDate: s.status === 'completed' ? (s.endDate || s.startDate) : null,
              currentTimestamp: 0,
              rating: null,
              notes: null,
            },
          ],
        },
      ];
    }

    let seriesDoc = await SeriesModel.findOne({
      userId: user._id,
      title: { $regex: new RegExp(`^${s.title}$`, 'i') },
    });

    const seriesPayload: any = {
      userId: user._id,
      title: enrichedData.title || s.title,
      creator: enrichedData.creator || null,
      year: enrichedData.year || s.year || null,
      genre: enrichedData.genre || null,
      posterImage: enrichedData.posterImage || null,
      catalogId: catalogDoc?._id || null,
      externalId: enrichedData.externalId || null,
      isFavorite: false,
      isWatchlist: false,
      seasons,
    };

    if (!seriesDoc) {
      seriesDoc = await SeriesModel.create({
        ...seriesPayload,
        publicId: randomUUID(),
      });
      seriesCreated++;
      console.log(`  ➕ Created series: ${seriesDoc.title} (ID: ${seriesDoc._id})`);
    } else {
      await SeriesModel.updateOne({ _id: seriesDoc._id }, { $set: seriesPayload });
      seriesUpdated++;
      console.log(`  🔄 Updated series: ${seriesDoc.title} (ID: ${seriesDoc._id})`);
    }

    // Upsert Media Session
    let session = await MediaSessionModel.findOne({
      userId: user._id,
      mediaId: seriesDoc._id,
      mediaType: 'series',
    });

    const sessionPayload: any = {
      userId: user._id,
      mediaId: seriesDoc._id,
      mediaType: 'series',
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate || null,
      isRewatch: s.isRewatch || false,
    };

    if (!session) {
      session = await MediaSessionModel.create({
        ...sessionPayload,
        publicId: randomUUID(),
      });
      console.log(`  ➕ Created session for ${seriesDoc.title} (${s.status})`);
    } else {
      await MediaSessionModel.updateOne({ _id: session._id }, { $set: sessionPayload });
      console.log(`  🔄 Updated session for ${seriesDoc.title} (${s.status})`);
    }

    await SeriesModel.updateOne({ _id: seriesDoc._id }, { $set: { currentSessionId: session._id } });
  }

  console.log('\n=============================================');
  console.log('🎉 Seeding Complete!');
  console.log(`Movies: ${moviesCreated} created, ${moviesUpdated} updated`);
  console.log(`Series: ${seriesCreated} created, ${seriesUpdated} updated`);
  console.log('=============================================');

  await mongoose.disconnect();
}

seedUserMedia().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
