DELETE FROM reviews;
INSERT INTO reviews (user_id, movie_id, content, is_spoiler) 
VALUES 
  ((SELECT id FROM users WHERE slug = 'normal001'), 1, '最高でした', false),
  ((SELECT id FROM users WHERE slug = 'normal002'), 1, '感動しました', true),
  ((SELECT id FROM users WHERE slug = 'normal001'), 2, '普通でした', false);