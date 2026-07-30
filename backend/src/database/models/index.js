const { sequelize } = require('../../config/database');
const User = require('./user.model');
const RefreshToken = require('./refreshToken.model');
const LoginHistory = require('./loginHistory.model');

User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(LoginHistory, { foreignKey: 'user_id', as: 'loginHistory' });
LoginHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  RefreshToken,
  LoginHistory,
};
