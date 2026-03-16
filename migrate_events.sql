-- RUN THIS IN YOUR ALWAYS DATA DATABASE MANAGER
-- This will update the events table to support the new admin fields.

ALTER TABLE events 
ADD COLUMN description TEXT AFTER name,
ADD COLUMN start_date DATETIME AFTER logo,
ADD COLUMN end_date DATETIME AFTER start_date,
ADD COLUMN location VARCHAR(255) AFTER end_date;

-- If you have an 'event_date' column, we'll keep it for now but the app will use start_date
-- If you want to clean up, you can run: 
-- ALTER TABLE events DROP COLUMN event_date;
