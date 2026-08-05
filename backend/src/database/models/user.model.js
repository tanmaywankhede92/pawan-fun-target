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
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  deviceUUID: {
    type: DataTypes.STRING(250),
    allowNull: true,
    defaultValue: '',
    field: 'deviceUUID',
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  role: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 3,
    references: {
      model: 'roles',
      key: 'id',
    },
  },
  sponsor_agent_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: USER_STATUS.ACTIVE,
  },
  margin: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
  login: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
  device: {
    type: DataTypes.CHAR(1),
    allowNull: false,
    defaultValue: 'M',
  },
  login_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  logout_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  underscored: true,
  paranoid: true,
});

module.exports = User;
