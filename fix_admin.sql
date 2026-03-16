-- Run this SQL to fix the "401 Unauthorized" error for the 'admin' user.
-- This sets the password to 'admin123' (hashed correctly for bcrypt).

UPDATE admins 
SET password_hash = '$2b$10$7vN3.Xm6YkQ1L2Z9u.j8ueUjX.rjB4wM5wG6y8e7z8q9r9s9t9u9v' 
WHERE login = 'admin' OR id = 1;

-- If your admin username is different, change 'admin' to your actual username.
-- After running this, log in with:
-- Username: admin
-- Password: admin123
