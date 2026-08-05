-- Fun Target full schema (new database)
-- Database: `funtarget`
-- Run this on a fresh database, OR apply table-by-table on an existing one.

CREATE DATABASE IF NOT EXISTS `funtarget` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `funtarget`;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Roles
INSERT INTO `roles` (`id`, `role_name`) VALUES
(1, 'superadmin'),
(2, 'agent'),
(3, 'user')
ON DUPLICATE KEY UPDATE `role_name` = VALUES(`role_name`);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `mob` VARCHAR(20) DEFAULT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `deviceUUID` VARCHAR(250) DEFAULT '',
  `balance` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `role` INT UNSIGNED NOT NULL DEFAULT '3',
  `sponsor_agent_id` BIGINT UNSIGNED DEFAULT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '1: Active, 0: Inactive',
  `margin` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
  `login` TINYINT(1) NOT NULL DEFAULT '0',
  `device` CHAR(1) DEFAULT 'M' COMMENT 'M: Mobile, W: Web, D: Desktop',
  `login_time` DATETIME DEFAULT NULL,
  `logout_time` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_users_username` (`username`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_sponsor` (`sponsor_agent_id`),
  KEY `idx_users_status_deleted` (`status`, `deleted_at`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_users_sponsor` FOREIGN KEY (`sponsor_agent_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BALANCE ADD / REMOVES (LEDGER TABLE)
CREATE TABLE IF NOT EXISTS `balance_add_removes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `balance_after` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `before_balance` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `add_balance` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `remove_balance` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_balance_user` (`user_id`),
  KEY `idx_balance_created` (`created_at`),
  CONSTRAINT `fk_balance_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. MAINTENANCE TABLE
CREATE TABLE IF NOT EXISTS `maintenance` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `message` TEXT,
  `status` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '0: Off, 1: On',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS `payouts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `percentages` DECIMAL(5,2) NOT NULL,
  `rate` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. RESULTS TABLE
CREATE TABLE IF NOT EXISTS `results` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `result` VARCHAR(255) NOT NULL,
  `result_time24` TIME NOT NULL,
  `result_date` DATE NOT NULL,
  `bonus` INT NOT NULL DEFAULT '1',
  `payout_status` TINYINT(1) NOT NULL DEFAULT '0',
  `edit_result` TINYINT(1) NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_draw_result` (`result_date`, `result_time24`),
  KEY `idx_results_date_time` (`result_date`, `result_time24`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. RECORD (BETTING / TICKETS) TABLE
CREATE TABLE IF NOT EXISTS `record` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `qty` INT NOT NULL DEFAULT '0',
  `amt` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `nxt_draw` VARCHAR(100) NOT NULL,
  `draw_time` TIME NOT NULL,
  `barcode` VARCHAR(100) NOT NULL UNIQUE,
  `tck_result` JSON DEFAULT NULL COMMENT 'Structured Ticket Payload',
  `tck_time` TIME DEFAULT NULL,
  `win_qty` INT NOT NULL DEFAULT '0',
  `win_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `win_result` VARCHAR(255) DEFAULT NULL,
  `bonus` INT NOT NULL DEFAULT '0',
  `claimed_amount` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `balance_after_bet` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `win_status` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '0: Pending, 1: Win, 2: Loss',
  `record_date` DATE NOT NULL,
  `lottery_name` VARCHAR(100) NOT NULL DEFAULT 'funtarget',
  `bonus_status` TINYINT(1) NOT NULL DEFAULT '0',
  `claim_status` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '0: Unclaimed, 1: Claimed',
  `claim_time` DATETIME DEFAULT NULL,
  `claim_date` DATE DEFAULT NULL,
  `user_commi` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `agent_commi` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_record_user` (`user_id`),
  KEY `idx_record_barcode` (`barcode`),
  KEY `idx_record_date_draw` (`record_date`, `draw_time`),
  KEY `idx_record_claim` (`claim_status`, `win_status`),
  KEY `idx_record_created` (`created_at`),
  CONSTRAINT `fk_record_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
