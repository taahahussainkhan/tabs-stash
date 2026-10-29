import mongoose from 'mongoose';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';
import { StatsService } from '../services/stats.service';

/**
 * Rebuild `user_stats` for every account.
 *
 * The counters self-heal lazily, so this is only needed after a deploy (to warm
 * the documents), after a data repair, or when you suspect drift:
 *
 *   npx tsx src/scripts/backfill_stats.ts
 */
async function main(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);

  const users = await UserModel.find({}, { _id: 1, email: 1 }).lean();
  console.log(`Reconciling stats for ${users.length} user(s)...`);

  let ok = 0;
  for (const user of users) {
    try {
      const stats = await StatsService.reconcile(String(user._id));
      ok += 1;
      console.log(
        `  ${(user as any).email || user._id}: ${stats.total_movies} movies, ` +
          `${stats.total_series} series, ${stats.total_books} books, ` +
          `${stats.total_stashed_tabs} sessions, ${stats.watching} active`
      );
    } catch (error) {
      console.error(`  ${(user as any).email || user._id}: failed -`, error);
    }
  }

  console.log(`Done. ${ok}/${users.length} reconciled.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
