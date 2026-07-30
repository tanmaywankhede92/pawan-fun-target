const { LoginHistory } = require('../database/models');

class LoginHistoryRepository {
  async create(data) {
    return LoginHistory.create(data);
  }

  async markLatestLogout(userId) {
    const latestLogin = await LoginHistory.findOne({
      where: { user_id: userId, logout_time: null, status: 'SUCCESS' },
      order: [['login_time', 'DESC']],
    });

    if (!latestLogin) {
      return null;
    }

    return latestLogin.update({ logout_time: new Date() });
  }
}

module.exports = new LoginHistoryRepository();
