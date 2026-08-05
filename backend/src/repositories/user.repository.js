const { User, Role } = require('../database/models');

const WITH_ROLE = {
  include: [{ model: Role, as: 'roleName' }],
};

class UserRepository {
  async findById(id) {
    return User.findByPk(id, {
      attributes: { exclude: ['password'] },
      ...WITH_ROLE,
    });
  }

  async findByUsername(username) {
    return User.findOne({
      where: { username },
      ...WITH_ROLE,
    });
  }

  async create(userData) {
    return User.create(userData);
  }

  async update(id, data) {
    return User.update(data, { where: { id } });
  }

  async updateLogin(id, context = {}) {
    const updates = { login_time: new Date(), login: 1 };
    if (context.device) {
      updates.device = String(context.device).charAt(0).toUpperCase();
    }
    if (context.deviceUuid) {
      updates.deviceUUID = context.deviceUuid;
    }
    return User.update(updates, { where: { id } });
  }

  async updateLogout(id) {
    return User.update({ logout_time: new Date(), login: 0 }, { where: { id } });
  }
}

module.exports = new UserRepository();
