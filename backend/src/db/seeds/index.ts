import { drizzle } from 'drizzle-orm/d1';
import { getPlatformProxy } from 'wrangler';
import * as movies from '@/db/seeds/movies';
import * as reviews from '@/db/seeds/reviews';
import * as users from '@/db/seeds/users';

const main = async () => {
  // biome-ignore lint/suspicious/noExplicitAny: D1 Bindings
  const { env, dispose } = await getPlatformProxy<any>();
  const db = drizzle(env.DB);

  console.log('クリーンアップを開始...');
  // 外部キーエラーを防ぐため、子テーブルから逆順にクリーン
  await reviews.clean(db);
  await movies.clean(db);
  await users.clean(db);

  console.log('シーディングを開始...');
  // 順番にシードを実行し、発行されたIDを持つデータを変数で受け回す
  const insertedUsers = await users.seed(db, env);
  const insertedMovies = await movies.seed(db);
  await reviews.seed(db, insertedUsers, insertedMovies);

  console.log('✅ 完了しました');
  await dispose();
};

main().catch(console.error);
