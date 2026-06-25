import { reviewsTable } from '../schema/reviews';

// biome-ignore lint/suspicious/noExplicitAny: cleanupでは型を決めきれてない
export const clean = async (db: any) => {
  await db.delete(reviewsTable);
};

// biome-ignore lint/suspicious/noExplicitAny: seedingでは型を決めきれてない
export const seed = async (db: any, users: any[], movies: any[]) => {
  if (!users || users.length < 3) throw new Error('❌ Usersデータが取得できていません');
  if (!movies || movies.length < 2) throw new Error('❌ Moviesデータが取得できていません');

  await db.insert(reviewsTable).values([
    { userId: users[1].id, movieId: movies[0].id, content: '最高でした', isSpoiler: false },
    { userId: users[2].id, movieId: movies[0].id, content: '感動しました', isSpoiler: true },
    { userId: users[1].id, movieId: movies[1].id, content: '普通でした', isSpoiler: false },
  ]);
};
