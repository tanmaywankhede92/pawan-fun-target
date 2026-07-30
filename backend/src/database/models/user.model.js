const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { USER_STATUS } = require('../../constants');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mob: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  deviceUUID: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: '',
    field: 'deviceUUID',
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  role: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  sponser_agent: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: USER_STATUS.ACTIVE,
  },
  margin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
  login: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  device: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'D',
  },
  login_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  logout_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  remember_token: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = User;
