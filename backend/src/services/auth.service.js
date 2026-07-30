const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../config/logger');
const { HTTP_STATUS, USER_ROLES, USER_STATUS } = require('../constants');
const ApiError = require('../utils/ApiError');
const userRepository = require('../repositories/user.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const loginHistoryRepository = require('../repositories/loginHistory.repository');

const REDIRECT_BY_ROLE = {
  [USER_ROLES.SUPER_ADMIN]: '/super-admin',
  [USER_ROLES.AGENT]: '/agent',
  [USER_ROLES.USER]: '/game',
};

class AuthService {
  async login(username, password, context = {}) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      await this.recordFailedLogin(null, context);
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.recordFailedLogin(user.id, context);
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    if (!this.isActiveUser(user)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is inactive or suspended');
    }

    const normalizedRole = this.normalizeRole(user.role);
    const redirect = REDIRECT_BY_ROLE[normalizedRole];
    if (!redirect) {
      logger.warn(`Login blocked for user ${user.id}: unsupported role "${user.role}"`);
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'User role is not allowed to login');
    }

    await userRepository.updateLastLogin(user.id);
    await loginHistoryRepository.create({
      user_id: user.id,
      device: context.device,
      device_uuid: context.deviceUuid,
      ip_address: context.ipAddress,
      browser: context.browser,
      login_time: new Date(),
      status: 'SUCCESS',
    });
    logger.info(`User ${user.id} authenticated with role ${normalizedRole}`);

    const accessToken = this.generateAccessToken(user, normalizedRole);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: this.toSafeUser(user, normalizedRole),
      accessToken,
      refreshToken,
      redirect,
    };
  }

  async refreshAccessToken(refreshTokenStr) {
    let decoded;
    try {
      decoded = jwt.verify(refreshTokenStr, config.jwt.refreshSecret);
    } catch (error) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
    }

    const storedToken = await refreshTokenRepository.findValidToken(this.hashToken(refreshTokenStr));
    if (!storedToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
    }

    if (String(storedToken.user_id) !== String(decoded.id)) {
      await refreshTokenRepository.revokeToken(storedToken.id);
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
    }

    await refreshTokenRepository.revokeToken(storedToken.id);

    const user = await userRepository.findById(storedToken.user_id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not found');
    }

    if (!this.isActiveUser(user)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is inactive or suspended');
    }

    const normalizedRole = this.normalizeRole(user.role);
    const accessToken = this.generateAccessToken(user, normalizedRole);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken: newRefreshToken, user: this.toSafeUser(user, normalizedRole) };
  }

  async logout(refreshTokenStr) {
    const storedToken = await refreshTokenRepository.findValidToken(this.hashToken(refreshTokenStr));
    if (storedToken) {
      await refreshTokenRepository.revokeToken(storedToken.id);
      await userRepository.updateLogout(storedToken.user_id);
      await loginHistoryRepository.markLatestLogout(storedToken.user_id);
    }
  }

  async logoutAll(userId) {
    await refreshTokenRepository.revokeAllUserTokens(userId);
    await userRepository.updateLogout(userId);
    await loginHistoryRepository.markLatestLogout(userId);
  }

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not found');
    }

    return this.toSafeUser(user, this.normalizeRole(user.role));
  }

  generateAccessToken(user, role = this.normalizeRole(user.role)) {
    return jwt.sign(
      { id: user.id, username: user.username, role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );
  }

  async generateRefreshToken(userId) {
    const expiresAt = this.getRefreshTokenExpiry();
    const token = jwt.sign(
      { id: userId, jti: uuidv4() },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    await refreshTokenRepository.create({
      user_id: userId,
      token: this.hashToken(token),
      expires_at: expiresAt,
    });

    return token;
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  getRefreshTokenExpiry() {
    const match = String(config.jwt.refreshExpiresIn).match(/^(\d+)([smhd])$/);
    const amount = match ? parseInt(match[1], 10) : 7;
    const unit = match ? match[2] : 'd';
    const multiplier = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    }[unit];

    return new Date(Date.now() + amount * multiplier);
  }

  normalizeRole(role) {
    const normalizedRole = String(role || '').trim().toUpperCase();
    const roleAliases = {
      SUPERADMIN: USER_ROLES.SUPER_ADMIN,
      SUPER_ADMIN: USER_ROLES.SUPER_ADMIN,
      AGENT: USER_ROLES.AGENT,
      USER: USER_ROLES.USER,
    };

    return roleAliases[normalizedRole] || normalizedRole;
  }

  isActiveUser(user) {
    return Number(user.status) === USER_STATUS.ACTIVE || String(user.status).toLowerCase() === 'active';
  }

  toSafeUser(user, role = this.normalizeRole(user.role)) {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role,
      balance: Number(user.balance || 0),
    };
  }

  async recordFailedLogin(userId, context) {
    if (!userId) {
      return;
    }

    await loginHistoryRepository.create({
      user_id: userId,
      device: context.device,
      device_uuid: context.deviceUuid,
      ip_address: context.ipAddress,
      browser: context.browser,
      login_time: new Date(),
      status: 'FAILED',
    });
    logger.warn(`Failed login attempt for user ${userId}`);
  }
}

module.exports = new AuthService();
