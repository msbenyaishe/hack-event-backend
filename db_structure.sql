-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql-msbenyaishe.alwaysdata.net
-- Generation Time: Mar 24, 2026 at 02:49 PM
-- Server version: 11.4.9-MariaDB
-- PHP Version: 8.4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `msbenyaishe_hackevent`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `login` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `login`, `password_hash`, `created_at`) VALUES
(2, 'admin@hackevent.com', '$2b$10$AW3kvjzaR/kULZveFH5Baun0dNuoB0BCdyV4AZSiDeF8Vz4op.b1y', '2026-03-16 00:32:43');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `event_date` datetime DEFAULT NULL,
  `status` enum('waiting','current','finished') DEFAULT 'waiting',
  `max_leaders` int(11) NOT NULL,
  `max_team_members` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `name`, `description`, `logo`, `start_date`, `end_date`, `location`, `event_date`, `status`, `max_leaders`, `max_team_members`, `created_at`) VALUES
(8, 'DEV203 Hackathon', '\"Never never give up\"', NULL, '2026-04-25 09:00:00', '2026-04-25 18:00:00', 'Tangier', NULL, NULL, 0, 0, '2026-03-23 15:08:34');

-- --------------------------------------------------------

--
-- Table structure for table `leader_invitations`
--

CREATE TABLE `leader_invitations` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `event_id` int(11) NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `portfolio` varchar(255) DEFAULT NULL,
  `role` enum('leader','member') DEFAULT 'member',
  `event_id` int(11) NOT NULL,
  `team_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `portfolio`, `role`, `event_id`, `team_id`, `created_at`) VALUES
(15, 'Mohamed Said', 'Benyaishe', 'mohamedsaidbenyaiche@gmail.com', '$2b$10$CNZRwhnFJx2kT7vCVvkGouHrbOR/TeRzuV0tjVnp7.v1mGzV6KN0e', 'https://msbenyaishe.github.io/Portfolio/', 'leader', 8, 16, '2026-03-23 15:11:24'),
(17, 'Said', 'Said', 'said2005@gmail.com', '$2b$10$ZBDVAMdmqIc.9Q3MqlPa6.0eIksL6gIsQYmb1R6IVAiaFnrZWA4YK', 'https://msbenyaishe.github.io/Portfolio/', 'member', 8, 16, '2026-03-23 19:02:11'),
(18, 'Houdaifa', 'Zaidi', 'houdaifazaidi04@gmail.com', '$2b$10$QFfDPfQQ1yLHXHxlBJ.ZI.5BuAkpRFqpiufUJ1hsCM/gdyTLrNnaC', 'https://houdaifazaidi.github.io/Portfolio/', 'leader', 8, 17, '2026-03-24 13:01:12'),
(19, 'Ali', 'Barrak', 'ali@hackevent.com', '$2b$10$heU1jTEf7LNcI1lnRBFk.eVCtHNwcO8DRgeV4UUNIkyjBXi1VBXTC', 'https://houdaifazaidi.github.io/Portfolio/', 'member', 8, 17, '2026-03-24 13:02:05');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` int(10) UNSIGNED NOT NULL,
  `data` mediumtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('0gYdm09oXpORCawXp3ULDqdcPcu5gALS', 1774439493, '{\"cookie\":{\"originalMaxAge\":86399999,\"partitioned\":true,\"expires\":\"2026-03-25T11:51:33.469Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"none\"},\"adminId\":2}'),
('4B7gyGYOC0zuqBB60I1jDKS6uCfxRT1f', 1774369290, '{\"cookie\":{\"originalMaxAge\":86399999,\"partitioned\":true,\"expires\":\"2026-03-24T16:21:30.320Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"none\"},\"adminId\":2,\"memberId\":15}'),
('OoZsLGHz_ZcmY3V-LNKwicS49tPHyqWg', 1774439239, '{\"cookie\":{\"originalMaxAge\":86400000,\"partitioned\":true,\"expires\":\"2026-03-25T11:47:18.568Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"none\"},\"adminId\":2}'),
('PieuPCI_maZH3R7D0YOn10kHqfngdNh_', 1774379587, '{\"cookie\":{\"originalMaxAge\":86400000,\"partitioned\":true,\"expires\":\"2026-03-24T19:13:07.093Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"none\"},\"adminId\":2}'),
('Vx48fHk68J2vDvEdn-sVms12tAXSi9o8', 1774379931, '{\"cookie\":{\"originalMaxAge\":86400000,\"partitioned\":true,\"expires\":\"2026-03-24T19:18:51.040Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"none\"},\"memberId\":15}'),
('iiR34boIzQ4bkIvE_JoAJ6AQgH8KKRLJ', 1774376789, '{\"cookie\":{\"originalMaxAge\":86399987,\"partitioned\":true,\"expires\":\"2026-03-24T18:26:28.891Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"none\"},\"adminId\":2,\"memberId\":15}'),
('ldA1DPxT4wVVjjO3d_5Phf8nMwWjXDCL', 1774445691, '{\"cookie\":{\"originalMaxAge\":86399999,\"partitioned\":true,\"expires\":\"2026-03-25T13:34:51.425Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"none\"},\"adminId\":2,\"memberId\":18}'),
('mSCGSLvGG3Saj5v-CiYAX4IceG-p7irc', 1774446555, '{\"cookie\":{\"originalMaxAge\":86399988,\"partitioned\":true,\"expires\":\"2026-03-25T13:49:14.537Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"none\"},\"memberId\":15,\"adminId\":2}'),
('wVPHsi4xHVQvaDlFV4xcUI4-u0gJs4Yh', 1774378335, '{\"cookie\":{\"originalMaxAge\":86400000,\"partitioned\":true,\"expires\":\"2026-03-24T18:52:14.903Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"none\"},\"adminId\":2}');

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `practical_score` int(11) DEFAULT 0,
  `theoretical_score` int(11) DEFAULT 0,
  `event_id` int(11) NOT NULL,
  `leader_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `name`, `logo`, `color`, `practical_score`, `theoretical_score`, `event_id`, `leader_id`) VALUES
(16, 'Said Team', 'https://res.cloudinary.com/dxweglo9y/image/upload/v1774282524/hackevent/teams/byn0ecby42xgdpllxjj5.png', '#4f46e5', 20, 20, 8, 15),
(17, 'Houdaifa Team', 'https://res.cloudinary.com/dxweglo9y/image/upload/v1774357426/hackevent/teams/esukaffgfltf7olyvsot.jpg', '#ffa200', 18, 20, 8, 18);

--
-- Triggers `teams`
--
DELIMITER $$
CREATE TRIGGER `before_team_delete` BEFORE DELETE ON `teams` FOR EACH ROW BEGIN

    DELETE FROM members
    WHERE team_id = OLD.id
    AND role = 'member';

    UPDATE members
    SET team_id = NULL
    WHERE team_id = OLD.id
    AND role = 'leader';

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `team_invitations`
--

CREATE TABLE `team_invitations` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `team_id` int(11) NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `workshop_id` int(11) NOT NULL,
  `repo_link` varchar(255) DEFAULT NULL,
  `web_app_link` varchar(255) DEFAULT NULL,
  `pdf_link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timers`
--

CREATE TABLE `timers` (
  `id` int(11) NOT NULL,
  `event_id` int(11) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `remaining_seconds` int(11) DEFAULT 0,
  `status` enum('not_started','running','paused','finished') DEFAULT 'not_started'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `timers`
--

INSERT INTO `timers` (`id`, `event_id`, `start_time`, `end_time`, `remaining_seconds`, `status`) VALUES
(1, NULL, NULL, NULL, 0, 'not_started');

-- --------------------------------------------------------

--
-- Table structure for table `workshops`
--

CREATE TABLE `workshops` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `technology` varchar(100) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `event_id` int(11) NOT NULL,
  `responsible_admin` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workshops`
--

INSERT INTO `workshops` (`id`, `title`, `description`, `technology`, `duration`, `start_time`, `location`, `event_id`, `responsible_admin`) VALUES
(35, 'EFF', 'Hello', '', 12, '2026-04-25 09:00:00', 'Tangier', 8, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `login` (`login`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leader_invitations`
--
ALTER TABLE `leader_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `fk_member_team` (`team_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`,`event_id`),
  ADD UNIQUE KEY `leader_id` (`leader_id`,`event_id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `leader_id_2` (`leader_id`);

--
-- Indexes for table `team_invitations`
--
ALTER TABLE `team_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `team_id` (`team_id`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `team_workshop` (`team_id`,`workshop_id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `workshop_id` (`workshop_id`);

--
-- Indexes for table `timers`
--
ALTER TABLE `timers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `workshops`
--
ALTER TABLE `workshops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `responsible_admin` (`responsible_admin`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `leader_invitations`
--
ALTER TABLE `leader_invitations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `team_invitations`
--
ALTER TABLE `team_invitations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timers`
--
ALTER TABLE `timers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `workshops`
--
ALTER TABLE `workshops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `leader_invitations`
--
ALTER TABLE `leader_invitations`
  ADD CONSTRAINT `leader_invitations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `fk_member_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `members_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teams_ibfk_2` FOREIGN KEY (`leader_id`) REFERENCES `members` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `team_invitations`
--
ALTER TABLE `team_invitations`
  ADD CONSTRAINT `team_invitations_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `timers`
--
ALTER TABLE `timers`
  ADD CONSTRAINT `timers_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `workshops`
--
ALTER TABLE `workshops`
  ADD CONSTRAINT `workshops_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `workshops_ibfk_2` FOREIGN KEY (`responsible_admin`) REFERENCES `members` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
