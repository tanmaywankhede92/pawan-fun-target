-- Authentication seed users.
-- Passwords are bcrypt hashes for:
-- superadmin / Admin@123
-- agent / Agent@123
-- tanmay / User@123

INSERT INTO users
  (name, mob, username, password, deviceUUID, balance, role, sponser_agent, status, margin, login, device, login_time, logout_time, remember_token, created_at, updated_at)
VALUES
  ('Super Admin', '1234567890', 'superadmin', '$2b$10$lSlivgGmtaHzJC/3k3O4a.mrboHVhlaY5gsAw9BC9RHTX3SV7MCUG', '', 0.00, 'SUPER_ADMIN', NULL, 1, 0, 0, 'D', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Agent', '1234567890', 'agent', '$2b$10$eDCx8PdmXZMl8u454HKspeWi8m1zAGZjguaxMG4KLNOz915Ld22OK', '', 0.00, 'AGENT', 'superadmin', 1, 10, 0, 'D', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Tanmay', NULL, 'tanmay', '$2b$10$x1S5tsUVD47JMDX.YpH8IuGFlLnckZoKesH5Koj1vmt79ljFgSMgK', '', 1000.00, 'USER', 'agent', 1, 0, 0, 'D', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  mob = VALUES(mob),
  password = VALUES(password),
  role = VALUES(role),
  sponser_agent = VALUES(sponser_agent),
  status = VALUES(status),
  updated_at = CURRENT_TIMESTAMP;
