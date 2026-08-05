const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../config/logger');
const { HTTP_STATUS, USER_ROLES, USER_STATUS } = require('../constants');
const ApiError = require('../utils/ApiError');
const userRepository = require('../repositories/user.repository');

const REDIRECT_BY_ROLE = {
  [USER_ROLES.SUPER_ADMIN]: '/super-admin',
  [USER_ROLES.AGENT]: '/agent',
  [USER_ROLES.USER]: '/game',
};

class AuthService {
  async login(username, password, context = {}) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    if (!this.isActiveUser(user)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is inactive or suspended');
    }

    const normalizedRole = this.normalizeRole(user);
    const redirect = REDIRECT_BY_ROLE[normalizedRole];
    if (!redirect) {
      logger.warn(`Login blocked for user ${user.id}: unsupported role "${this.getRoleLabel(user)}"`);
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'User role is not allowed to login');
    }

    await userRepository.updateLogin(user.id, context);
    logger.info(`User ${user.id} authenticated with role ${normalizedRole}`);

    const accessToken = this.generateAccessToken(user, normalizedRole);

    return {
      user: this.toSafeUser(user, normalizedRole),
      accessToken,
      redirect,
    };
  }

  async logout(userId) {
    await userRepository.updateLogout(userId);
  }

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not found');
    }

    return this.toSafeUser(user, this.normalizeRole(user));
  }

  generateAccessToken(user, role = this.normalizeRole(user)) {
    return jwt.sign(
      { id: user.id, username: user.username, role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );
  }

  normalizeRole(user) {
    const rawRole = user && typeof user === 'object'
      ? (user.roleName ? user.roleName.role_name : user.role)
      : user;
    const normalizedRole = String(rawRole || '').trim().toUpperCase();
    const roleAliases = {
      SUPERADMIN: USER_ROLES.SUPER_ADMIN,
      SUPER_ADMIN: USER_ROLES.SUPER_ADMIN,
      AGENT: USER_ROLES.AGENT,
      USER: USER_ROLES.USER,
    };

    return roleAliases[normalizedRole] || normalizedRole;
  }

  getRoleLabel(user) {
    return user && user.roleName ? user.roleName.role_name : user && user.role;
  }

  isActiveUser(user) {
    return Number(user.status) === USER_STATUS.ACTIVE || String(user.status).toLowerCase() === 'active';
  }

  toSafeUser(user, role = this.normalizeRole(user)) {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role,
      balance: Number(user.balance || 0),
    };
  }
}

module.exports = new AuthService();
