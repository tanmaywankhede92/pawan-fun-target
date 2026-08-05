const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Maintenance = sequelize.define('maintenance', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: false,
});

module.exports = Maintenance;
