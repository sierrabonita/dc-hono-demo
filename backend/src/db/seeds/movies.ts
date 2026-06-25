import { moviesTable } from '../schema/movies';

// biome-ignore lint/suspicious/noExplicitAny: cleanupではdbの型を決めきれてない
export const clean = async (db: any) => {
  await db.delete(moviesTable);
};

// biome-ignore lint/suspicious/noExplicitAny: seedingではdbの型を決めきれてない
export const seed = async (db: any) => {
  await db.insert(moviesTable).values([
    {
      title: 'ダークナイト',
      originalTitle: 'The Dark Knight',
      releaseDate: '2008-07-19',
    },
    {
      title: 'タイタニック',
      originalTitle: 'Titanic',
      releaseDate: '1997-12-20',
    },
  ]);

  return await db.select().from(moviesTable);
};
