const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const LoginHistory = sequelize.define('login_history', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  device: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  device_uuid: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  browser: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  login_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  logout_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'SUCCESS',
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = LoginHistory;
