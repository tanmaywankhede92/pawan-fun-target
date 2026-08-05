const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Result = sequelize.define('results', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  result: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  result_time24: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  result_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  bonus: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  payout_status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
  edit_result: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  underscored: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      name: 'unique_draw_result',
      fields: ['result_date', 'result_time24'],
    },
  ],
});

module.exports = Result;
