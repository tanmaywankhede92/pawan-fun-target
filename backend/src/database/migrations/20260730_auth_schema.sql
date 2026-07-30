-- Authentication schema upgrade for the legacy Fun Target database.
--
-- Compatibility notes:
-- - Legacy columns are intentionally preserved: mob, deviceUUID, sponser_agent,
--   login, device, login_time, logout_time, and remember_token.
-- - sponser_agent is not renamed because legacy data stores the sponsor username
--   there. sponsor_agent_id is added as a nullable FK for new code that can use
--   a relational link without breaking old reads.
-- - status remains the legacy numeric flag: 1 active, 0 inactive, 2 suspended.

START TRANSACTION;

UPDATE users
SET role = CASE LOWER(role)
  WHEN 'superadmin' THEN 'SUPER_ADMIN'
  WHEN 'super_admin' THEN 'SUPER_ADMIN'
  WHEN 'agent' THEN 'AGENT'
  WHEN 'user' THEN 'USER'
  ELSE role
END;

ALTER TABLE users
  MODIFY id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  MODIFY name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  MODIFY mob VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  MODIFY username VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  MODIFY password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  MODIFY deviceUUID VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  MODIFY balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  MODIFY role ENUM('SUPER_ADMIN', 'AGENT', 'USER') NOT NULL,
  MODIFY sponser_agent VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  ADD COLUMN sponsor_agent_id BIGINT UNSIGNED NULL AFTER sponser_agent,
  MODIFY status TINYINT NOT NULL DEFAULT 1 COMMENT '1=active, 0=inactive, 2=suspended',
  MODIFY margin INT NOT NULL DEFAULT 10,
  MODIFY login TINYINT NOT NULL DEFAULT 0 COMMENT '1=logged in, 0=logged out',
  MODIFY device VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'D',
  MODIFY login_time DATETIME DEFAULT NULL,
  MODIFY logout_time DATETIME DEFAULT NULL,
  MODIFY remember_token VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  MODIFY created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  MODIFY updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX idx_users_username_unique ON users (username);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_sponsor_agent_id ON users (sponsor_agent_id);

ALTER TABLE users
  ADD CONSTRAINT fk_users_sponsor_agent
  FOREIGN KEY (sponsor_agent_id) REFERENCES users(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash of the refresh JWT',
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_refresh_tokens_token_unique (token),
  KEY idx_refresh_tokens_user_id (user_id),
  KEY idx_refresh_tokens_expires_at (expires_at),
  KEY idx_refresh_tokens_revoked_at (revoked_at),
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  device VARCHAR(50) DEFAULT NULL,
  device_uuid VARCHAR(200) DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  browser VARCHAR(255) DEFAULT NULL,
  login_time DATETIME NOT NULL,
  logout_time DATETIME DEFAULT NULL,
  status ENUM('SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_login_history_user_id (user_id),
  KEY idx_login_history_login_time (login_time),
  CONSTRAINT fk_login_history_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
