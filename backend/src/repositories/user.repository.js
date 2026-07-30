const { User } = require('../database/models');

class UserRepository {
  async findById(id) {
    return User.findByPk(id, { attributes: { exclude: ['password'] } });
  }

  async findByUsername(username) {
    return User.findOne({ where: { username } });
  }

  async create(userData) {
    return User.create(userData);
  }

  async update(id, data) {
    return User.update(data, { where: { id } });
  }

  async updateLastLogin(id) {
    return User.update({ login_time: new Date(), login: 1 }, { where: { id } });
  }

  async updateLogout(id) {
    return User.update({ logout_time: new Date(), login: 0 }, { where: { id } });
  }
}

module.exports = new UserRepository();
