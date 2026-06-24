DELETE FROM users;
INSERT INTO users (slug, name, email, password, role) 
VALUES 
  ('admin001', '管理者', 'admin_1@example.com', 'temporary_password', 1),
  ('normal001', '山田 太郎', 'normal_1@example.com', 'temporary_password', 0),
  ('normal002', '田中 花子', 'normal_2@example.com', 'temporary_password', 0);
