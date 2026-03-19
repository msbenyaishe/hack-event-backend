-- MIGRATE WORKSHOPS TABLE
-- Add missing columns for scheduling and location

ALTER TABLE workshops 
ADD COLUMN start_time DATETIME AFTER duration,
ADD COLUMN location VARCHAR(255) AFTER start_time;

-- Optional: If the responsible_admin FK is causing issues for admins, 
-- we ensure it's NULLable (which it already is in db_structure.sql).
-- The controller will handle setting it to NULL for admin users.
