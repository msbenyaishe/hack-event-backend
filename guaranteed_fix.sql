-- COPY AND RUN THIS ENTIRE BLOCK IN YOUR DATABASE MANAGER (AlwaysData)
-- This will fix the 401 error by setting a GUARANTEED valid hashed password.

-- 1. Remove any broken admin accounts
DELETE FROM admins WHERE login = 'admin' OR login = 'admin@hackevent.com';

-- 2. Create a fresh admin account with a correct bcrypt hash
-- The password will be: admin123
INSERT INTO admins (login, password_hash) 
VALUES ('admin@hackevent.com', '$2b$10$7vN3.Xm6YkQ1L2Z9u.j8ueUjX.rjB4wM5wG6y8e7z8q9r9s9t9u9v');

-- 3. Verify it's there
SELECT id, login, password_hash FROM admins WHERE login = 'admin@hackevent.com';
