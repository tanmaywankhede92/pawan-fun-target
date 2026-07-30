const { RefreshToken } = require('../database/models');
const { Op } = require('sequelize');

class RefreshTokenRepository {
  async create(data) {
    return RefreshToken.create(data);
  }

  async findValidToken(token) {
    return RefreshToken.findOne({
      where: {
        token,
        revoked_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
    });
  }

  async revokeToken(id) {
    return RefreshToken.update({ revoked_at: new Date() }, { where: { id, revoked_at: null } });
  }

  async revokeAllUserTokens(userId) {
    return RefreshToken.update(
      { revoked_at: new Date() },
      { where: { user_id: userId, revoked_at: null } }
    );
  }

  async findByUserId(userId) {
    return RefreshToken.findAll({ where: { user_id: userId } });
  }
}

module.exports = new RefreshTokenRepository();
