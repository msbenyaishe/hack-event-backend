-- ======================================================
-- ADMINS
-- ======================================================

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- EVENTS
-- ======================================================

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    logo VARCHAR(255),
    event_date DATETIME,
    status ENUM('waiting','current','finished') DEFAULT 'waiting',
    max_leaders INT NOT NULL,
    max_team_members INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- MEMBERS
-- ======================================================

CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    portfolio VARCHAR(255),
    role ENUM('leader','member') DEFAULT 'member',
    event_id INT NOT NULL,
    team_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX(event_id),

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

-- ======================================================
-- TEAMS
-- ======================================================

CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    color VARCHAR(20),
    practical_score INT DEFAULT 0,
    theoretical_score INT DEFAULT 0,
    event_id INT NOT NULL,
    leader_id INT NOT NULL,

    UNIQUE(name, event_id),
    UNIQUE(leader_id, event_id),

    INDEX(event_id),
    INDEX(leader_id),

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    FOREIGN KEY (leader_id)
        REFERENCES members(id)
        ON DELETE CASCADE
);

-- ======================================================
-- MEMBER TEAM RELATION
-- ======================================================

ALTER TABLE members
ADD CONSTRAINT fk_member_team
FOREIGN KEY (team_id)
REFERENCES teams(id)
ON DELETE SET NULL;

-- ======================================================
-- WORKSHOPS
-- ======================================================

CREATE TABLE workshops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    technology VARCHAR(100),
    duration INT,
    event_id INT NOT NULL,

    INDEX(event_id),

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

-- ======================================================
-- LEADER INVITATIONS
-- ======================================================

CREATE TABLE leader_invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    event_id INT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX(event_id),

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

-- ======================================================
-- TEAM INVITATIONS
-- ======================================================

CREATE TABLE team_invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    team_id INT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX(team_id),

    FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON DELETE CASCADE
);

-- ======================================================
-- EVENT TIMER
-- ======================================================

CREATE TABLE timers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NULL,
    start_time DATETIME,
    end_time DATETIME,
    remaining_seconds INT DEFAULT 0,
    status ENUM('not_started','running','paused','finished') DEFAULT 'not_started',

    INDEX(event_id),

    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

-- ======================================================
-- SESSIONS (express-mysql-session)
-- ======================================================

CREATE TABLE sessions (
  session_id varchar(128) COLLATE utf8mb4_bin NOT NULL,
  expires int unsigned NOT NULL,
  data mediumtext COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- ======================================================
-- TRIGGER: HANDLE TEAM DELETION
-- ======================================================

DELIMITER $$

CREATE TRIGGER before_team_delete
BEFORE DELETE ON teams
FOR EACH ROW
BEGIN

    DELETE FROM members
    WHERE team_id = OLD.id
    AND role = 'member';

    UPDATE members
    SET team_id = NULL
    WHERE team_id = OLD.id
    AND role = 'leader';

END$$

DELIMITER ;