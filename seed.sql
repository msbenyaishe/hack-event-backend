-- Run this SQL in your database manager (AlwaysData) to create your first event
-- This will fix the 404 error when the frontend tries to load the current event.

INSERT INTO events (name, status, max_leaders, max_team_members, event_date) 
VALUES ('Global Hackathon', 'current', 10, 50, NOW() + INTERVAL 30 DAY);

-- Optional: Add a timer for the event
INSERT INTO timers (event_id, remaining_seconds, status) 
SELECT id, 86400, 'running' FROM events WHERE name = 'Global Hackathon' LIMIT 1;
